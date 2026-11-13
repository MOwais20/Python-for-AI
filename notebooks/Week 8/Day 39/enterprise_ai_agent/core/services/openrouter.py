import os

from openai import OpenAI
from dotenv import load_dotenv

# Load environments
load_dotenv()

# Models Defined
MODEL = "openai/gpt-oss-120b"
EMBEDDING_MODEL = "nvidia/nemotron-3.5-embed-8b:free"


openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPEN_ROUTER_KEY"),
)
