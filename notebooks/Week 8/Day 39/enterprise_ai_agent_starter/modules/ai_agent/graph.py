"""Build the LangGraph agent step by step in class."""
# import os
# from langchain_core.messages import SystemMessage
# from langgraph.graph import START, MessagesState, StateGraph
# from langgraph.prebuilt import ToolNode, tools_condition
# from core import settings  # noqa: F401  (loads .env)
# from langchain_openai import ChatOpenAI

# LangChain 
from langchain_core.messages import SystemMessage
from langgraph.graph import START, MessagesState, StateGraph
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import ToolNode, tools_condition

from modules.ai_agent.tools import TOOLS
from core.services.llms import LLMS

SYSTEM_PROMPT = """You are the friendly customer support assistant for Xander Restaurant.
Keep replies short. Prices are in Pakistani rupees. Use fetch_menu for menu/prices.
For complaints, collect customer name, phone, complaint and order ID. Validate the
order ID with validate_order_id, then call log_complaint only for a valid order.
Never invent facts. Ask for missing details.
"""

def create_chat_model(llm="grok"):
    return ChatOpenAI(**LLMS[llm], temperature=0)

def assistant(state: MessagesState, model_with_tools):
    reply = model_with_tools.invoke([SystemMessage(content=SYSTEM_PROMPT), *state["messages"]])
    return {"messages": [reply]}

def build_graph():
    tools = TOOLS if tools is None else tools
    model = create_chat_model()

    model_with_tools = model.bind_tools(tools)

    assistant_node = assistant(MessagesState, model_with_tools)

    builder = StateGraph(MessagesState)

    # Connecting Assistant Node
    builder.add_node("assistant", assistant_node)

    # Connecting Tools
    builder.add_node("tools", ToolNode(tools))

    # Edges - means connecting nodes for the flow
    builder.add_edge(START, assistant_node)
    builder.add_node("tools", ToolNode(tools))
    builder.add_conditional_edges("assistant", tools_condition)
    builder.add_edge("tools", "assistant")

    return builder.compile
    

# Step 1: LLM settings (ollama and grok)
# Step 2: create_chat_model(llm)


# Step 3: build_graph(llm)
#   3a. bind tools to the model
#   3b. assistant node
#   3c. tools node
#   3d. edges: START -> assistant, assistant -> tools/END, tools -> assistant
#   3e. compile


# Step 4: run it
