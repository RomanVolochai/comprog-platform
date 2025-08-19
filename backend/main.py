from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .routes import lessons as lessons_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Comprog Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, comprog!"}

app.include_router(lessons_routes.router, prefix="/api")