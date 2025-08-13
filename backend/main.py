from fastapi import FastAPI

app = FastAPI(title="Comprog Platfrom API")

@app.get("/")
def read_root():
    return {"message": "Hello, comprog!"}