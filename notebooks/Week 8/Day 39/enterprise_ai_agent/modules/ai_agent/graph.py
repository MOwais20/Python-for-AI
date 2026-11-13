"""LangGraph agent: assistant node <-> tools node, with a choice of LLM."""
import os
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from core import settings  # noqa: F401  (loads .env)
from modules.ai_agent.tools import TOOLS

SYSTEM_PROMPT = """You are the friendly customer support assistant for Xander Restaurant.
Keep replies short. Prices are in Pakistani rupees. Use fetch_menu for menu/prices.
For complaints, collect customer name, phone, complaint and order ID. Validate the
order ID with validate_order_id, then call log_complaint only for a valid order.
Never invent facts. Ask for missing details.
"""

# ponytail: both speak the OpenAI API, so one ChatOpenAI class covers both
LLMS = {
    "ollama": dict(
        base_url="http://localhost:11434/v1",
        api_key="ollama",
        model=os.getenv("OLLAMA_MODEL", "qwen3:4b")),
    "groq": dict(
        base_url="https://api.groq.com/openai/v1",
        api_key=os.getenv("GROQ_API_KEY"),
        model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")),
}


def create_chat_model(llm="ollama"):
    return ChatOpenAI(**LLMS[llm], temperature=0)


def build_graph(llm="ollama", model=None, tools=None):
    # model= lets tests pass a fake model instead of a real LLM
    tools = TOOLS if tools is None else tools
    model = create_chat_model(llm) if model is None else model
    model_with_tools = model.bind_tools(tools)

    # Node 1: the LLM reads all messages and replies (text, or a tool call)
    def assistant(state: MessagesState):
        reply = model_with_tools.invoke(
            [SystemMessage(content=SYSTEM_PROMPT), *state["messages"]])
        return {"messages": [reply]}

    builder = StateGraph(MessagesState)
    builder.add_node("assistant", assistant)
    # Node 2: runs the tool the LLM asked for
    builder.add_node("tools", ToolNode(tools))
    builder.add_edge(START, "assistant")                   # start -> assistant
    # tool call? -> tools, else -> END
    builder.add_conditional_edges("assistant", tools_condition)
    # tool result goes back to the LLM
    builder.add_edge("tools", "assistant")
    return builder.compile()


if __name__ == "__main__":
    import sys
    graph = build_graph(sys.argv[1] if len(sys.argv) > 1 else "ollama")
    out = graph.invoke({"messages": [("user", "What is on the menu?")]})
    print(out["messages"][-1].content)
