import os
from dotenv import load_dotenv

load_dotenv()

if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = "ollama"



LLMs = {
    "groq": {
        "baseUrl": "https://api.groq.com/openai/v1",
        "apiKey": os.getenv("GROQ_API_KEY"),
        "model": "openai/gpt-oss-120b"
    },
    "ollama": {
        "baseUrl": "http://localhost:11434/v1",
        "apiKey": "ollama",
        "model": "qwen3:4b"
    }
}
