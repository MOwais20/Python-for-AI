"""Paths are relative to this project, even when launched from another folder."""
import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_DIR / ".env")
DATA_DIR = Path(os.getenv("DATA_DIR", str(PROJECT_DIR / "data")))
DATABASE_PATH = DATA_DIR / "history.sqlite3"
KNOWLEDGE_PATH = PROJECT_DIR / "knowledge" / "xander_restaurant_knowledge_base.txt"
