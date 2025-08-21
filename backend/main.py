from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, concepts, implementations, problems
from .db import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Comprog Platform API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(concepts.router, prefix="/api/concepts", tags=["concepts"])
app.include_router(implementations.router, prefix="/api/implementations", tags=["implementations"])
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])


@app.get("/")
def read_root():
    return {"message": "Comprog Platform API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}