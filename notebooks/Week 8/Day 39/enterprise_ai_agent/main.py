from fastapi import FastAPI

app = FastAPI()


@app.get("/", status_code=200)
async def root():
    return {
        "message": 
        "Hello World"
        }
