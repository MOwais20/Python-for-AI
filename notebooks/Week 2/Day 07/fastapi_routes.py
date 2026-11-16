# FastAPI route decorators from Day 8.
#
# Run it:
#     pip install "fastapi[standard]"
#     fastapi dev fastapi_routes.py
# Then open http://127.0.0.1:8000/docs to try each address.

from fastapi import FastAPI

app = FastAPI()                                   # the web app - keeps a list of addresses

@app.get("/")
def show_homepage():
    return {
        "message": "This is a simple server",
        "version": "1.0"
    }

@app.get("/products")                             # GET /products -> someone wants to READ data
def list_products():
    return ["Mouse", "Keyboard", "Monitor"]


@app.post("/sales")                               # POST /sales -> someone is SENDING new data
def create_sale(item: str, price: int, quantity: int):
    return {"item": item, "total": price * quantity}
