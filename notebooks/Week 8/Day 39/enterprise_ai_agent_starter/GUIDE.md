# Build the Xander Restaurant Agent — Step by Step

We build one small piece, test it, then build the next piece.

**Ready for you:** `core/` (settings, database), `tools.py` (3 tools), all packages.
**You build:** the graph, the service, the routes, and the supervisor.

Before class:

```bash
  ollama pull qwen3:4b      # free local LLM
cp .env.example .env      # add GROK_API_KEY if you want to use Grok
```

---

## Part 1 — The Graph (`modules/ai_agent/graph.py`)

A graph has **nodes** (steps that do work) and **edges** (arrows between steps).

```
START → assistant ──(tool needed?)── yes → tools ─┐
           ↑                                      │
           └──────────────────────────────────────┘
                     │ no
                     ↓
                    END
```

### Step 1: LLM settings

**Why?** We want to choose the LLM by name: `"ollama"` or `"grok"`.
Ollama and Grok both use the same API style, so one class `ChatOpenAI` works for both.
Only the address (`base_url`) and model name change.

```python
LLMS = {
    "ollama": dict(
        base_url="http://localhost:11434/v1",
        api_key="ollama",
        model=os.getenv("OLLAMA_MODEL", "qwen3:4b")),
    "grok": dict(
        base_url="https://api.x.ai/v1",
        api_key=os.getenv("GROK_API_KEY"),
        model=os.getenv("GROK_MODEL", "grok-4")),
}
```

### Step 2: Make the model

**Why?** One small function that gives us a ready model. Every other file calls it,
so if we change the model later, we change it in one place only.
`temperature=0` means the answer is the same every time (no random words).

```python
def create_chat_model(llm="ollama"):
    return ChatOpenAI(**LLMS[llm], temperature=0)
```

### Step 3: Build the graph

**Why?** The LLM can only write text. It cannot run Python.
The graph is the plan that says: LLM thinks → we run the tool → LLM reads the result → answer.

```python
  def build_graph(llm="ollama", model=None, tools=None):
    tools = TOOLS if tools is None else tools
    model = create_chat_model(llm) if model is None else model

    # 3a. Tell the model which tools it can use
    model_with_tools = model.bind_tools(tools)

    # 3b. Node 1: the LLM reads all messages and replies
    

    builder = StateGraph(MessagesState)
    builder.add_node("assistant", assistant)

    # 3c. Node 2: runs the tool the LLM asked for
    builder.add_node("tools", ToolNode(tools))

    # 3d. Edges
    builder.add_edge(START, "assistant")
    builder.add_conditional_edges("assistant", tools_condition)  # tool? -> tools, else -> END
    builder.add_edge("tools", "assistant")                       # tool result goes back to LLM

    # 3e. Compile
    return builder.compile()
```

**Why each part?**


| Part             | What it does                                       | Why we need it                                    |
| ---------------- | -------------------------------------------------- | ------------------------------------------------- |
| `bind_tools`     | Gives the LLM the list of tools (name + docstring) | Without it, the LLM does not know the tools exist |
| `MessagesState`  | The shared notebook: a list of all messages        | Every node reads it and adds to it                |
| `assistant` node | Calls the LLM                                      | This is the "brain" that decides                  |
| `tools` node     | Runs the Python function the LLM asked for         | The LLM cannot run code itself                    |
| `compile()`      | Checks the plan and makes it runnable              | You cannot`invoke` a graph before compiling       |

**Why edges?** Nodes are the workers. **Edges are the arrows that say who works next.**
Without edges, LangGraph does not know the order.


| Edge                                                  | What it does                                                               | Why                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `add_edge(START, "assistant")`                        | First step is always the LLM                                               | The LLM must read the question first                                  |
| `add_conditional_edges("assistant", tools_condition)` | A fork in the road. Did the LLM ask for a tool? Yes →`tools`. No → `END` | Sometimes we need a tool ("menu?"), sometimes not ("hello")           |
| `add_edge("tools", "assistant")`                      | After the tool, go back to the LLM                                         | The tool gives raw data (a list). The LLM turns it into a nice answer |

This back-and-forth (`assistant → tools → assistant`) is a **loop**.
It can repeat: for a complaint the LLM first calls `validate_order_id`, then `log_complaint`.

Everyday example: a waiter (assistant) takes your order. If it needs cooking, the waiter
goes to the kitchen (tools), then comes back to you with the food (answer).
If you only say "hello", the waiter answers directly — no kitchen needed (END).

### Step 4: Run it

**Why `if __name__ == "__main__":`?**
Python gives every file a name in `__name__`.

- If you **run** the file yourself (`python -m modules.ai_agent.graph`), `__name__` is `"__main__"`, so the test code runs.
- If another file **imports** it (`service.py` does `from modules.ai_agent.graph import build_graph`), `__name__` is `"modules.ai_agent.graph"`, so the test code does **not** run.

So we can test this file alone, and it will not ask the LLM a question every time the server starts.

`sys.argv[1]` is the word you type after the command (`ollama` or `grok`).

```python
if __name__ == "__main__":
    import sys
    graph = build_graph(sys.argv[1] if len(sys.argv) > 1 else "ollama")
    out = graph.invoke({"messages": [("user", "What is on the menu?")]})
    print(out["messages"][-1].content)
```

```bash
uv run python -m modules.ai_agent.graph ollama
uv run python -m modules.ai_agent.graph grok
```

**Check:** you see the menu with prices.
**Ask students:** which nodes ran? (assistant → tools → assistant → END)

---

## Part 2 — Chat with Memory (`/chat` and `/history`)

Flow of one request:

```
POST /ai/chat → router.py → service.py → load history from SQLite
                                       → run graph
                                       → save new messages to SQLite
                                       → return answer
```

### Step 5: Add `session_id` to the schema (`schema.py`)

**Why?** Many users chat at the same time. `session_id` tells us whose chat this is.
Same id = same chat memory. Different id = new chat.
`BaseModel` checks the request: if `query` or `session_id` is missing, FastAPI returns an error (422) before our code runs.

```python
class chat_payload(BaseModel):
    query: str
    session_id: str
```

### Step 6: The service (`service.py`)

**Why?** The LLM has no memory. Every call is a fresh start.
So we load the old messages from SQLite, send them with the new question, and save the new messages after.

- `graph = build_graph(...)` is outside the function → the graph is built **once** when the server starts, not on every message.
- `result["messages"][len(history):]` → the result has old + new messages. We save only the new ones, so nothing is saved twice.
- `get_history` hides tool steps, because the user only wants to see questions and answers.

```python
from langchain_core.messages import HumanMessage
from core.database import sqlite
from modules.ai_agent.graph import build_graph

graph = build_graph("ollama")   # or "grok"


def chat(query, session_id):
    history = sqlite.load_messages(session_id)                    # 1. old messages
    result = graph.invoke({"messages": history + [HumanMessage(content=query)]})  # 2. run
    new_messages = result["messages"][len(history):]              # 3. only the new ones
    sqlite.append_messages(session_id, new_messages)              # 4. save
    return result["messages"][-1].content                         # 5. final answer


def get_history(session_id):
    # Show only user questions and final AI answers (hide tool steps)
    return [
        {"role": "user" if m.type == "human" else "ai", "content": m.content}
        for m in sqlite.load_messages(session_id)
        if m.type == "human" or (m.type == "ai" and m.content and not m.tool_calls
                                 and m.name in (None, "supervisor"))
    ]
```

### Step 7: The routes (`router.py`)

**Why?** The router is the "door" of our app. It only receives the request and gives back the answer.
The real work is in `service.py`. This keeps each file small and with one job.

- `POST /chat` → we **send** data (a question), so we use POST.
- `GET /history` → we only **read** data, so we use GET.

```python
from fastapi import APIRouter
from .schema import chat_payload
from . import service

ai_agent_router = APIRouter(prefix="/ai")

@ai_agent_router.post("/chat")
def initiate_chat(payload: chat_payload):
    answer = service.chat(payload.query, payload.session_id)
    return {"session_id": payload.session_id, "answer": answer}

@ai_agent_router.get("/history")
def get_history(session_id: str):
    return {"session_id": session_id, "messages": service.get_history(session_id)}
```

### Step 8: Create the tables (`main.py`)

**Why?** SQLite cannot save messages into a table that does not exist.
`CREATE TABLE IF NOT EXISTS` makes the table the first time and does nothing after that, so it is safe on every start.

Add these two lines above `app = FastAPI()`:

```python
from core.database.sqlite import init_database
init_database()   # create tables once when the server starts
```

### Step 9: Test

**Why?** We check memory works for one user and does not leak to another user.

```bash
uv run fastapi dev main.py
```

Open http://127.0.0.1:8000/docs

1. `POST /ai/chat` → `{"query": "Price of biryani?", "session_id": "ali"}`
2. `POST /ai/chat` → `{"query": "What did I just ask?", "session_id": "ali"}` → it remembers
3. `GET /ai/history?session_id=ali` → 2 questions, 2 answers
4. `GET /ai/history?session_id=sara` → empty list (new user)
5. Stop the server, start again, check history → still there (saved in SQLite)

---

## Part 3 — Supervisor (Manager + Workers)

One agent with many tools gets confused. So we make a **team**:

- **Supervisor** = the manager. It reads the question and sends it to the right worker.
- **Workers** = small agents. Each one has a few tools and one job.

Everyday example: in a restaurant the manager at the counter does not cook. They send the order to the kitchen and complaints to the duty manager.

```
              User
               ↓
          supervisor
          ↙        ↘
   menu_agent   complaint_agent
  (fetch_menu)  (validate_order_id, log_complaint)
```

### Step 10: Make `modules/ai_agent/supervisor.py`

**Why?**

- `create_react_agent(...)` → makes a worker. Its `name` is how the manager calls it.
- Small `prompt` per worker → each worker only knows its own job, so it makes fewer mistakes.
- `create_supervisor(...)` → makes the manager. It gets a "transfer" tool for each worker (`transfer_to_menu_agent`, `transfer_to_complaint_agent`).
- `.compile()` → same as Part 1: makes it runnable.
- `create_chat_model(llm)` → we reuse Step 2. Ollama or Grok works here too.

```python
"""Supervisor: a manager agent that sends each question to the right worker agent."""
from langgraph.prebuilt import create_react_agent
from langgraph_supervisor import create_supervisor
from modules.ai_agent.graph import create_chat_model
from modules.ai_agent.tools import fetch_menu, validate_order_id, log_complaint


def build_supervisor(llm="ollama"):
    model = create_chat_model(llm)

    # Worker 1
    menu_agent = create_react_agent(
        model=model,
        tools=[fetch_menu],
        name="menu_agent",
        prompt="You answer menu and price questions. Prices are in PKR. Always use fetch_menu.",
    )

    # Worker 2
    complaint_agent = create_react_agent(
        model=model,
        tools=[validate_order_id, log_complaint],
        name="complaint_agent",
        prompt=("You handle complaints. Collect customer name, phone, order ID and complaint. "
                "Check the order ID with validate_order_id, then save with log_complaint. "
                "Ask for missing details. Never invent a complaint ID."),
    )

    # Manager
    supervisor = create_supervisor(
        agents=[menu_agent, complaint_agent],
        model=model,
        prompt=("You are the manager of Xander Restaurant support. "
                "Menu or price questions -> menu_agent. Complaints -> complaint_agent. "
                "For greetings, answer yourself in one short line."),
    )
    return supervisor.compile()
```

Note: `create_react_agent` builds the same graph we built by hand in Part 1
(assistant node + tools node + edges). Now students know what is inside it.

### Step 11: Use the supervisor in `service.py`

**Why only two lines?** The supervisor is also a graph with `invoke`. So the service does not care if it is one agent or a team.

Change two lines:

```python
from modules.ai_agent.supervisor import build_supervisor

graph = build_supervisor("ollama")   # or "grok"
```

`/chat` and `/history` stay the same.

### Step 12: Test

**Why?** We check the manager sends each question to the right worker.

1. `{"query": "Price of biryani?", "session_id": "ali"}` → goes to menu_agent
2. `{"query": "My name is Ali, phone 0300-1234567, order OR-1045, my burger was cold.", "session_id": "ali"}` → goes to complaint_agent → Complaint ID

---

## Home Problem — add more workers

Same steps, new agent. Ideas for Xander Restaurant:


| Agent               | Job                               | Tools to write                                       |
| ------------------- | --------------------------------- | ---------------------------------------------------- |
| `info_agent`        | Branches, opening hours, policies | `search_knowledge` (RAG, Day 24)                     |
| `order_agent`       | Check order status                | `get_order_status(order_id)`                         |
| `reservation_agent` | Book a table                      | `check_table(date, time, people)`, `book_table(...)` |
| `deals_agent`       | Today's deals and discounts       | `fetch_deals()`                                      |

For each one: 1) write the tool in `tools.py`, 2) make the worker with `create_react_agent`, 3) add it to `agents=[...]`, 4) add one line to the supervisor prompt.
