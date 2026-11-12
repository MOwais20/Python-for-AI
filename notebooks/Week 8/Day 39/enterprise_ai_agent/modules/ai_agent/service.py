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
    return result["messages"][-1].content


def get_history(session_id):
    # Only show user questions and final AI answers, not tool steps
    return [
        {"role": "user" if m.type == "human" else "ai", "content": m.content}
        for m in sqlite.load_messages(session_id)
        if m.type == "human" or (m.type == "ai" and m.content and not m.tool_calls and m.name in (None, "supervisor"))
    ]
