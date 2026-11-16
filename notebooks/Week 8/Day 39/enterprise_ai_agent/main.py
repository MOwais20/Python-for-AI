from fastapi import FastAPI
from core.database.sqlite import init_database
from fastapi.middleware.cors import CORSMiddleware



# Import Routers
from modules.ai_agent.router import ai_agent_router

init_database()   # create tables once when the server starts
app = FastAPI()


origins = [
   "https://example.org",
   "http://localhost:5500",
   "https://platform.ecochamp.app",
   "https://ecochamp.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    ai_agent_router,
    tags=["AI Module"]
)

@app.get("/", status_code=200)
async def root():
    return {
        "message":  "Your at the Xander's Backend"
    }
