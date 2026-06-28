import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from app.main import app
from app.db.session import Base, get_db
from app.models.subsidy_scheme import SubsidyScheme
from app.models.eligibility_rule import EligibilityRule
from app.services.eligibility_engine import EligibilityEngine

# Create a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_farmer.db"
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
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def get_auth_token(email="farmer@example.com", role="farmer"):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "pass",
            "full_name": "Farmer Joe",
            "role": role
        }
    )
    res = client.post("/api/v1/auth/login", json={"email": email, "password": "pass"})
    return res.json()["access_token"]

def test_create_profile():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/farmer/profile", headers=headers, json={
        "aadhar_number": "123456789012",
        "age": 45,
        "state": "Maharashtra"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["aadhar_number"] == "123456789012"
    assert data["state"] == "Maharashtra"

def test_add_farm():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Must have profile first
    client.post("/api/v1/farmer/profile", headers=headers, json={
        "aadhar_number": "123456789012"
    })
    
    res = client.post("/api/v1/farmer/farm", headers=headers, json={
        "land_area": 5.5,
        "soil_type": "Black",
        "ownership_type": "Owned"
    })
    assert res.status_code == 200
    assert res.json()["land_area"] == 5.5

def test_engine_logic():
    engine = EligibilityEngine()
    
    # Create mock farmer and farm
    class MockFarmer:
        state = "Punjab"
        age = 30
        
    class MockFarm:
        land_area = 2.0
        
    class MockRule:
        rule_logic = {"field": "land_area", "operator": "<", "value": 5.0}
        
    class MockScheme:
        applicable_states = ["Punjab", "Haryana"]
        rules = [MockRule()]
        
    farmer = MockFarmer()
    farm = MockFarm()
    scheme = MockScheme()
    
    assert engine.evaluate_scheme(scheme, farmer, farm) == True
    
    # Change farm area to fail rule
    farm.land_area = 10.0
    assert engine.evaluate_scheme(scheme, farmer, farm) == False

def test_eligibility_and_apply():
    from unittest.mock import patch
    
    from datetime import datetime
    scheme = SubsidyScheme(
        id=uuid.uuid4(),
        scheme_name="Small Farmer Support",
        subsidy_amount=10000,
        applicable_states=["Maharashtra"],
        applicable_seasons=[],
        is_active=True,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    rule = EligibilityRule(
        scheme_id=scheme.id,
        rule_name="Area Less Than 5",
        rule_logic={"field": "land_area", "operator": "<", "value": 5.0}
    )
    scheme.rules = [rule]
    
    token = get_auth_token(email="apply@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    client.post("/api/v1/farmer/profile", headers=headers, json={
        "aadhar_number": "111122223333",
        "state": "Maharashtra"
    })
    
    client.post("/api/v1/farmer/farm", headers=headers, json={
        "land_area": 3.0
    })
    
    # Check eligibility with mocked repo
    with patch("app.repositories.farmer_repo.SubsidySchemeRepository.list_active_schemes", return_value=[scheme]):
        res = client.get("/api/v1/farmer/subsidies", headers=headers)
        assert res.status_code == 200
        schemes = res.json()
        assert len(schemes) == 1
        assert schemes[0]["scheme_name"] == "Small Farmer Support"
    
    # Apply with mocked repo
    with patch("app.repositories.farmer_repo.SubsidySchemeRepository.get_by_id", return_value=scheme):
        res = client.post("/api/v1/farmer/apply", headers=headers, json={"scheme_id": str(scheme.id)})
        assert res.status_code == 200
    
    # List applications
    res = client.get("/api/v1/farmer/applications", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) == 1
