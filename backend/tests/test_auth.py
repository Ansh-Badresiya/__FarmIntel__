import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

# Create a test database (in-memory SQLite for simplicity)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

@compiles(ARRAY, "sqlite")
def compile_array_sqlite(type_, compiler, **kw):
    return "TEXT"

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "TEXT"

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup: recreate tables before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Teardown
    Base.metadata.drop_all(bind=engine)

def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123",
            "full_name": "Test User",
            "role": "farmer"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
    assert "password" not in data

def test_register_existing_user():
    # First registration
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "strongpassword123",
            "full_name": "Test User"
        }
    )
    # Second registration with same email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "anotherpassword",
            "full_name": "Another User"
        }
    )
    assert response.status_code == 400

def test_login_user():
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "password": "strongpassword123",
            "full_name": "Login User"
        }
    )
    
    # Try logging in
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "strongpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password():
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrong@example.com",
            "password": "strongpassword123",
            "full_name": "Wrong User"
        }
    )
    
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 400

def test_read_users_me():
    # Register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "me@example.com",
            "password": "strongpassword123",
            "full_name": "Me User"
        }
    )
    
    # Login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "me@example.com",
            "password": "strongpassword123"
        }
    )
    token = login_response.json()["access_token"]
    
    # Access protected route
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["full_name"] == "Me User"
