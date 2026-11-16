from pydantic import BaseModel

class chat_payload(BaseModel):
    query: str
    session_id: str
