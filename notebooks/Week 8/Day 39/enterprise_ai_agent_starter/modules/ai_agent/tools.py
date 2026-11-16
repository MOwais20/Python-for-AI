"""The same restaurant actions as Day 24, now described with @tool."""
from langchain_core.tools import tool
from core.database.sqlite import save_complaint
# from modules.knowledge.service import search_knowledge

order_list = [
    "OR-1045",
    "OR-1046",
    "OR-1047"
]

@tool
def fetch_menu() -> list[dict]:
    """Get the restaurant menu with prices in PKR."""
    return [
        {"name": "Zinger Burger", "price": 850},
        {"name": "Chicken Biryani", "price": 450},
        {"name": "Club Sandwich", "price": 700}
    ]

@tool
def validate_order_id(order_id: str) -> bool:
    """Check if an order ID like OR-1045 is valid."""
    if order_id in order_list:
        return True
    return False

@tool
def log_complaint(customer_name: str, order_id: str, phone: str, complaint: str) -> dict:
    """Save a customer complaint for a valid order ID."""
    return save_complaint(customer_name, order_id, phone, complaint)

TOOLS = [
    fetch_menu,
    validate_order_id,
    log_complaint
]

















# VALID_ORDER_IDS = {"OR-1045", "OR-1046", "OR-1047"}


# @tool
# def fetch_menu() -> list[dict]:
#     """Get the demo restaurant's standard menu and current demo prices in PKR."""
#     return [
#         {"name": "Zinger Burger", "price": 850},
#         {"name": "Chicken Biryani", "price": 450},
#         {"name": "Club Sandwich", "price": 700},
#     ]

# @tool
# def validate_order_id(order_id: str) -> bool:
#     """Check whether an order ID exists before logging a complaint."""
#     return order_id in VALID_ORDER_IDS


# @tool
# def log_complaint(customer_name: str, order_id: str, phone: str, complaint: str) -> dict:
#     """Save a complaint after collecting the customer's name, valid order ID, phone and complaint."""
#     # Enforce the rule in Python even if the model skips the validation tool.
#     if order_id not in VALID_ORDER_IDS:
#         return {"error": "Invalid order ID. Ask for OR-1045, OR-1046 or OR-1047 for this demo."}
#     if not all(value.strip() for value in [customer_name, phone, complaint]):
#         return {"error": "Collect the customer name, phone and complaint before saving."}
#     return save_complaint(customer_name, order_id, phone, complaint)


# @tool
# def retrieve_restaurant_info(query: str) -> str:
#     """Search restaurant documents for branch locations, hours, history, exclusive dishes and policies."""
#     return search_knowledge(query)


# TOOLS = [fetch_menu, validate_order_id, log_complaint, retrieve_restaurant_info]
