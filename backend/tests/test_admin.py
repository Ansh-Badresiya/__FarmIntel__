import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

# ── SQLite in-memory test database ──────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_admin.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Patching types for SQLite compatibility
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

@compiles(ARRAY, "sqlite")
def compile_array_sqlite(type_, compiler, **kw):
    return "TEXT"

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "TEXT"

import sqlite3
import json
sqlite3.register_adapter(list, json.dumps)
sqlite3.register_adapter(dict, json.dumps)

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
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def _register_and_login(email: str, role: str) -> str:
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "pass", "full_name": "Test User", "role": role},
    )
    res = client.post("/api/v1/auth/login", json={"email": email, "password": "pass"})
    return res.json()["access_token"]

def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

class TestAdminSchemes:
    def test_create_scheme(self):
        token = _register_and_login("admin@test.com", "admin")
        res = client.post("/api/v1/admin/scheme", headers=_auth(token), json={
            "scheme_name": "Admin Scheme",
            "subsidy_amount": 10000.0,
            "applicable_states": ["Gujrat"],
            "applicable_seasons": ["Rabi"]
        })
        assert res.status_code == 201
        data = res.json()
        assert data["scheme_name"] == "Admin Scheme"
        assert data["subsidy_amount"] == 10000.0
        assert data["id"] is not None

    def test_update_scheme(self):
        token = _register_and_login("admin2@test.com", "admin")
        res = client.post("/api/v1/admin/scheme", headers=_auth(token), json={
            "scheme_name": "Update Scheme",
            "subsidy_amount": 10000.0
        })
        scheme_id = res.json()["id"]

        update_res = client.put(f"/api/v1/admin/scheme/{scheme_id}", headers=_auth(token), json={
            "subsidy_amount": 15000.0,
            "is_active": False
        })
        assert update_res.status_code == 200
        data = update_res.json()
        assert data["subsidy_amount"] == 15000.0
        assert data["is_active"] == False

    def test_delete_scheme(self):
        token = _register_and_login("admin3@test.com", "admin")
        res = client.post("/api/v1/admin/scheme", headers=_auth(token), json={
            "scheme_name": "Delete Scheme",
            "subsidy_amount": 10000.0
        })
        scheme_id = res.json()["id"]

        del_res = client.delete(f"/api/v1/admin/scheme/{scheme_id}", headers=_auth(token))
        assert del_res.status_code == 200
        assert del_res.json()["is_active"] == False

class TestAdminRules:
    def test_crud_rules(self):
        token = _register_and_login("admin_rules@test.com", "admin")
        # 1. Create Scheme
        scheme_res = client.post("/api/v1/admin/scheme", headers=_auth(token), json={
            "scheme_name": "Rule Scheme",
            "subsidy_amount": 5000.0
        })
        scheme_id = scheme_res.json()["id"]

        # 2. Add Rule
        rule_res = client.post("/api/v1/admin/rule", headers=_auth(token), json={
            "scheme_id": scheme_id,
            "rule_name": "Area Rule",
            "rule_logic": {"field": "land_area", "op": ">", "val": 2.0}
        })
        assert rule_res.status_code == 201
        rule_id = rule_res.json()["id"]

        # 3. Update Rule
        up_res = client.put(f"/api/v1/admin/rule/{rule_id}", headers=_auth(token), json={
            "priority": 10
        })
        assert up_res.status_code == 200
        assert up_res.json()["priority"] == 10

        # 4. Delete Rule
        del_res = client.delete(f"/api/v1/admin/rule/{rule_id}", headers=_auth(token))
        assert del_res.status_code == 204

class TestAdminUsersAndDashboard:
    def test_list_users_and_update_role(self):
        admin_token = _register_and_login("admin_users@test.com", "admin")
        farmer_token = _register_and_login("farmer_usr@test.com", "farmer")

        list_res = client.get("/api/v1/admin/users", headers=_auth(admin_token))
        assert list_res.status_code == 200
        users = list_res.json()
        assert len(users) >= 2

        farmer_id = next(u["id"] for u in users if u["email"] == "farmer_usr@test.com")
        
        # Update role to officer
        up_res = client.put(f"/api/v1/admin/users/{farmer_id}/role", headers=_auth(admin_token), json={
            "role": "officer"
        })
        assert up_res.status_code == 200
        assert up_res.json()["role"] == "officer"

    def test_dashboard_stats(self):
        token = _register_and_login("admin_dash@test.com", "admin")
        res = client.get("/api/v1/admin/dashboard", headers=_auth(token))
        assert res.status_code == 200
        data = res.json()
        assert "total_farmers" in data
        assert "applications_pending" in data
        assert "total_schemes" in data

class TestAdminAuth:
    def test_non_admin_cannot_access(self):
        farmer_token = _register_and_login("farmer_no_admin@test.com", "farmer")
        res = client.get("/api/v1/admin/dashboard", headers=_auth(farmer_token))
        assert res.status_code == 403
