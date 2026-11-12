"""Run once before asking questions about the restaurant documents."""
from modules.knowledge.service import build_index

if __name__ == "__main__":
    print(f"Indexed {build_index()} restaurant paragraphs.")
