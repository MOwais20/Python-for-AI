from fastapi import FastAPI
from core.database.sqlite import init_database

# Import Routers
from modules.ai_agent.router import ai_agent_router

init_database()   # create tables once when the server starts
app = FastAPI()

app.include_router(
    ai_agent_router,
    tags=["AI Module"]
)


@app.get("/", status_code=200)
async def root():
    return {
        "message":  "Your at the Xander's Backend"
    }
