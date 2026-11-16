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
