from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, User, Candidate
from .auth import get_password_hash
from .routers import auth, candidates
import json

SQLALCHEMY_DATABASE_URL = "sqlite:///./techkraft.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TechKraft Recruitment API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial data if needed
def seed_data():
    db = SessionLocal()
    if db.query(User).count() == 0:
        # Create Admin
        admin = User(
            email="admin@techkraft.com",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        # Create Reviewer
        reviewer = User(
            email="reviewer@techkraft.com",
            hashed_password=get_password_hash("reviewer123"),
            role="reviewer"
        )
        db.add(admin)
        db.add(reviewer)
        
        # Create some candidates
        candidates = [
            Candidate(
                name="John Doe",
                email="john@example.com",
                role_applied="Full Stack Engineer",
                status="new",
                skills=json.dumps(["React", "FastAPI", "Python"]),
                internal_notes="Looks promising."
            ),
            Candidate(
                name="Jane Smith",
                email="jane@example.com",
                role_applied="Backend Engineer",
                status="reviewed",
                skills=json.dumps(["Python", "Go", "Kubernetes"]),
                internal_notes="Strong backend background."
            ),
            Candidate(
                name="Robert Brown",
                email="robert@example.com",
                role_applied="Frontend Engineer",
                status="new",
                skills=json.dumps(["Vue", "CSS", "TypeScript"]),
                internal_notes="Excellent portfolio."
            )
        ]
        db.add_all(candidates)
        db.commit()
    db.close()

seed_data()

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(candidates.router, prefix="/candidates", tags=["Candidates"])

@app.get("/")
async def root():
    return {"message": "Welcome to TechKraft Recruitment API"}
