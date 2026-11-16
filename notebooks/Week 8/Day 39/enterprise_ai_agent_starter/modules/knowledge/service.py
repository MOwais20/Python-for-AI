"""Day 24 RAG: load → chunk → embed → store; at chat time embed → retrieve."""
import os
import chromadb
from core import settings
from core.services.openrouter import create_embeddings

COLLECTION_NAME = "restaurant_vector_db"


def get_collection():
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(settings.DATA_DIR / "chroma"))
    return client.get_or_create_collection(COLLECTION_NAME, embedding_function=None)


def build_index():
    text = settings.KNOWLEDGE_PATH.read_text(encoding="utf-8")
    chunks = [part.strip() for part in text.split("\n\n") if len(part.strip()) > 30]
    embeddings = create_embeddings(chunks)
    collection = get_collection()
    # A dedicated demo collection is rebuilt so removed paragraphs cannot linger.
    old_ids = collection.get()["ids"]
    if old_ids:
        collection.delete(ids=old_ids)
    collection.upsert(
        ids=[f"xander-{i}" for i in range(len(chunks))],
        documents=chunks,
        embeddings=embeddings,
        metadatas=[{"source": settings.KNOWLEDGE_PATH.name} for _ in chunks],
    )
    collection.modify(metadata={"embedding_model": os.getenv("EMBEDDING_MODEL", "nvidia/nemotron-3.5-embed-8b:free")})
    return len(chunks)


def search_knowledge(query):
    collection = get_collection()
    if collection.count() == 0:
        return "Knowledge index is empty. Ask the instructor to run: uv run python -m scripts.ingest"
    model = os.getenv("EMBEDDING_MODEL", "nvidia/nemotron-3.5-embed-8b:free")
    if (collection.metadata or {}).get("embedding_model") != model:
        return "Embedding model changed. Rebuild the knowledge index before answering."
    results = collection.query(
        query_embeddings=create_embeddings([query]),
        n_results=min(4, collection.count()),
        include=["documents", "metadatas"],
    )
    return "\n\n".join(
        f"Source: {meta['source']}\n{text}"
        for text, meta in zip(results["documents"][0], results["metadatas"][0])
    )
