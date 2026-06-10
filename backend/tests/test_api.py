import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..app.main import app, SQLALCHEMY_DATABASE_URL
from ..app.auth import get_db
from ..app.models import Base

# Setup test DB
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_login_success():
    response = client.post(
        "/auth/login",
        data={"username": "admin@techkraft.com", "password": "admin123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_candidates_authorized():
    # First login
    login_res = client.post(
        "/auth/login",
        data={"username": "admin@techkraft.com", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    
    response = client.get(
        "/candidates/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "items" in response.json()

def test_reviewer_cannot_see_internal_notes():
    # Login as reviewer
    login_res = client.post(
        "/auth/login",
        data={"username": "reviewer@techkraft.com", "password": "reviewer123"}
    )
    token = login_res.json()["access_token"]
    
    # Get candidate 1
    response = client.get(
        "/candidates/1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["internal_notes"] is None

def test_admin_can_see_internal_notes():
    # Login as admin
    login_res = client.post(
        "/auth/login",
        data={"username": "admin@techkraft.com", "password": "admin123"}
    )
    token = login_res.json()["access_token"]
    
    # Get candidate 1
    response = client.get(
        "/candidates/1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["internal_notes"] is not None
