"""Load history -> run graph -> save new messages."""
from langchain_core.messages import HumanMessage
from core.database import sqlite
from modules.ai_agent.supervisor import build_supervisor

graph = build_supervisor("groq")   # or "ollama", or graph.build_graph("ollama") for one agent


def chat(query, session_id):
    history = sqlite.load_messages(session_id)
    result = graph.invoke({"messages": history + [HumanMessage(content=query)]})
    new_messages = result["messages"][len(history):]
    sqlite.append_messages(session_id, new_messages)
    # The supervisor often adds a closing line after the worker's answer.
    # Prefer the last worker answer; fall back to the last reply (e.g. greetings).
    for m in reversed(new_messages):
        if is_answer(m) and m.name in WORKERS:
            return m.content
    return result["messages"][-1].content


WORKERS = ("menu_agent", "complaint_agent")


def is_answer(m):
    # A real AI text reply: not a tool call, not the "Transferring back" hand-off
    return (m.type == "ai" and m.content and not m.tool_calls
            and not m.content.startswith("Transferring back"))


def get_history(session_id):
    # Only show user questions and final AI answers, not tool steps
    shown = []
    for m in sqlite.load_messages(session_id):
        if m.type != "human" and not is_answer(m):
            continue
        item = {"role": "user" if m.type == "human" else "ai", "content": m.content.strip()}
        if item != (shown[-1] if shown else None):   # supervisor repeats the worker's answer
            shown.append(item)
    return shown
