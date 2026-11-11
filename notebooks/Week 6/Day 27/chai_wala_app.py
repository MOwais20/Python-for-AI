import os
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=os.getenv("OPEN_ROUTER_KEY"))
MODEL = "nvidia/nemotron-3.5-lightning:free"

FACTS = """
Menu: doodh patti chai Rs 120, Kashmiri chai Rs 200, green tea Rs 100,
plain paratha Rs 80, aloo paratha Rs 150, samosa Rs 60, cake rusk pack Rs 250.
Delivery: Gulberg, DHA, Model Town, Johar Town. Charge Rs 100, free for orders of Rs 1500 or more.
Delivery takes 30 to 45 minutes. Last order at 10:30 pm.
Timings: every day 9 am to 11 pm. Friday closed 1 pm to 2 pm for Jumma.
Payment: cash, card, JazzCash, Easypaisa. Cash on delivery is available.
Phone: 042-1234567. WhatsApp: 0300-1234567.
"""

SYSTEM_PROMPT = f"""
You are the support bot of Chai Wala, a tea shop in Gulberg, Lahore.

Facts:
{FACTS}

Rules:
- Use ONLY the facts above. Never make up a price, place or time.
- Write prices like "Rs 120".
- Be friendly. Reply in at most 3 short sentences.
- If the answer is not in the facts, say: "Sorry, I don't know. Please call 042-1234567."
"""

st.title("☕ Chai Wala Support Bot")

if "messages" not in st.session_state:                       # 1. first run only: start the history
    st.session_state.messages = [{"role": "system", "content": SYSTEM_PROMPT}]

for m in st.session_state.messages[1:]:                       # 2. show the old chat (not the rules)
    st.chat_message(m["role"]).write(m["content"])

question = st.chat_input("Ask Chai Wala...")                  # 3. the text box at the bottom
if question:
    st.chat_message("user").write(question)
    st.session_state.messages.append({"role": "user", "content": question})

    history = st.session_state.messages
    short = [history[0]] + history[1:][-6:]                   # 4. rules + last 6 messages
    r = client.chat.completions.create(model=MODEL, messages=short, temperature=0)
    reply = r.choices[0].message.content

    st.chat_message("assistant").write(reply)
    st.session_state.messages.append({"role": "assistant", "content": reply})
