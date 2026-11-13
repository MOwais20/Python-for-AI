import os
from pathlib import Path
import streamlit as st
import chromadb
from dotenv import load_dotenv
from openai import OpenAI

MODEL = "nvidia/nemotron-3.5-lightning:free"
load_dotenv()
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=os.getenv("OPEN_ROUTER_KEY"))

def ask(messages, temperature=0):
    try:
        r = client.chat.completions.create(model=MODEL, messages=messages, temperature=temperature)
        return (r.choices[0].message.content or "").strip()
    except Exception as e:                    # no key? rate limit (429)? wrong model name?
        return f"ERROR: {e}"

EMB_MODEL = "nvidia/nemotron-3-embed-1b:free"      # embedding model (free, Day 24)

def embed(texts):
    r = client.embeddings.create(model=EMB_MODEL, input=texts)    # one request for the whole list
    return [item.embedding for item in r.data]                    # one vector per text

from pathlib import Path

def load_documents(folder):
    docs = []
    for path in sorted(Path(folder).glob("*.txt")):              # every .txt file in the folder
        docs.append({"source": path.name, "text": path.read_text(encoding="utf-8")})
    return docs

def chunk_by_paragraph(text):
    parts = [p.strip() for p in text.split("\n\n")]              # a blank line = a new paragraph
    return [p for p in parts if len(p) > 30]                      # skip very short parts, like titles

def chunk_documents(docs):
    chunks = []
    for doc in docs:
        for i, text in enumerate(chunk_by_paragraph(doc["text"])):
            chunks.append({"id": f"{doc['source']}-{i}", "source": doc["source"], "text": text})
    return chunks

chunks = chunk_documents(load_documents("chai_wala_docs"))

import chromadb

db = chromadb.PersistentClient(path="chai_db")              # saved in the folder "chai_db": not lost
shop = db.get_or_create_collection(name="chai_wala_docs", metadata={"hnsw:space": "cosine"})

if shop.count() == 0:                                       # embed only the first time (saves free requests)
    shop.add(
        ids=[c["id"] for c in chunks],
        documents=[c["text"] for c in chunks],
        metadatas=[{"source": c["source"]} for c in chunks],    # keep the file name with each chunk
        embeddings=embed([c["text"] for c in chunks]),
    )

def retrieve(question, n=3):
    r = shop.query(query_embeddings=embed([question]), n_results=n)
    return [{"text": t, "source": m["source"], "distance": d}
            for t, m, d in zip(r["documents"][0], r["metadatas"][0], r["distances"][0])]

I_DONT_KNOW = "Sorry, I don't know. Please call 042-1234567."
CUTOFF = 0.85                    # choose it by looking at YOUR distances (Step 4)

RAG_SYSTEM = f"""You are the support bot of Chai Wala, a tea shop in Gulberg, Lahore.
Rules:
- Answer using ONLY the context. Never make up a price, place or time.
- If the answer is not in the context, reply exactly: "{I_DONT_KNOW}"
- At the end, write the source file in brackets, like [menu.txt].
- Be friendly. Reply in at most 3 short sentences."""

def rag(question):
    found = retrieve(question)                                          # 1. Retrieve
    if found[0]["distance"] > CUTOFF:                                   # nothing is close: do not ask the LLM
        return I_DONT_KNOW
    context = "\n\n".join(f"[{f['source']}] {f['text']}" for f in found)   # each chunk with its source
    messages = [{"role": "system", "content": RAG_SYSTEM},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}]   # 2. Augment
    return ask(messages)                                                # 3. Generate

# ---------------- the web page (Day 27) ----------------
st.title("☕ Chai Wala Support Bot")
st.caption("Answers come from the Chai Wala documents. The source file is shown in [brackets].")

if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "assistant", "content": "Assalam o Alaikum! Ask me about our menu, delivery, timings or refunds."}]

for m in st.session_state.messages:
    st.chat_message(m["role"]).write(m["content"])

question = st.chat_input("Ask Chai Wala...")
if question:
    st.chat_message("user").write(question)
    st.session_state.messages.append({"role": "user", "content": question})

    reply = rag(question)                                    # RAG version 2 (Day 32)

    st.chat_message("assistant").write(reply)
    st.session_state.messages.append({"role": "assistant", "content": reply})
