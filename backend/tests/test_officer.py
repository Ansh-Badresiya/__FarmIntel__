"""
Tests – Officer Module
======================
Covers all officer-facing endpoints:

  ✓ Officers can list their pending applications (filtered by assigned_officer)
  ✓ Admins see ALL pending applications
  ✓ Officers can view full application detail
  ✓ Approve a pending application
  ✓ Reject a pending application (reason mandatory)
  ✓ Request additional documents from the farmer
  ✓ Cannot approve/reject a non-pending application (conflict)
  ✓ Farmers are blocked from officer endpoints (403)
  ✓ Unauthenticated requests are rejected (401)
  ✓ Admin can assign an officer to an application
  ✓ Officer cannot use the admin-only assign endpoint (403)
"""

import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db

# ── SQLite in-memory test database ──────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_officer.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# SQLite does not support PostgreSQL-specific types, so we patch them.
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


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_db():
    """Rebuild all tables before every test and tear them down after."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _register_and_login(email: str, password: str = "pass123", role: str = "farmer") -> str:
    """Register a user and return their JWT access token."""
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Test User", "role": role},
    )
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_scheme(db_session) -> uuid.UUID:
    """Insert a minimal SubsidyScheme directly into the test DB."""
    from app.models.subsidy_scheme import SubsidyScheme

    scheme = SubsidyScheme(
        id=uuid.uuid4(),
        scheme_name="Test Scheme",
        description="For testing",
        subsidy_amount=5000.0,
        applicable_states=[],
        applicable_seasons=[],
        is_active=True,
    )
    db_session.add(scheme)
    db_session.commit()
    db_session.refresh(scheme)
    return scheme.id


def _create_farmer_application(farmer_token: str, scheme_id: uuid.UUID) -> uuid.UUID:
    """
    Set up a complete farmer profile + farm and submit an application.
    Returns the application ID.
    """
    h = _auth(farmer_token)

    client.post("/api/v1/farmer/profile", headers=h, json={
        "aadhar_number": f"{uuid.uuid4().int % 10**12:012d}",
        "state": "TestState",
    })
    client.post("/api/v1/farmer/farm", headers=h, json={"land_area": 3.0})

    from unittest.mock import patch
    from app.models.subsidy_scheme import SubsidyScheme as SS
    from datetime import datetime

    mock_scheme = SS(
        id=scheme_id,
        scheme_name="Test Scheme",
        subsidy_amount=5000.0,
        applicable_states=["TestState"],
        applicable_seasons=[],
        is_active=True,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    with patch("app.repositories.farmer_repo.SubsidySchemeRepository.get_by_id", return_value=mock_scheme):
        res = client.post("/api/v1/farmer/apply", headers=h, json={"scheme_id": str(scheme_id)})
    assert res.status_code == 200, f"Application submission failed: {res.text}"
    return uuid.UUID(res.json()["id"])


def _get_db_session():
    """Return a raw DB session for direct manipulation in tests."""
    return TestingSessionLocal()


# ── Authentication / Authorization tests ─────────────────────────────────────

class TestOfficerAuth:
    def test_unauthenticated_list_returns_401(self):
        res = client.get("/api/v1/officer/applications")
        assert res.status_code == 401

    def test_farmer_cannot_access_officer_endpoints(self):
        token = _register_and_login("farmer@test.com", role="farmer")
        res = client.get("/api/v1/officer/applications", headers=_auth(token))
        assert res.status_code == 403

    def test_officer_can_access_applications_list(self):
        token = _register_and_login("officer@test.com", role="officer")
        res = client.get("/api/v1/officer/applications", headers=_auth(token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_admin_can_access_applications_list(self):
        token = _register_and_login("admin@test.com", role="admin")
        res = client.get("/api/v1/officer/applications", headers=_auth(token))
        assert res.status_code == 200
        assert isinstance(res.json(), list)


# ── List applications ─────────────────────────────────────────────────────────

class TestListApplications:
    def test_officer_sees_empty_list_when_no_assigned_applications(self):
        """An officer should see an empty list when nothing is assigned to them."""
        officer_token = _register_and_login("officer_empty@test.com", role="officer")
        res = client.get("/api/v1/officer/applications", headers=_auth(officer_token))
        assert res.status_code == 200
        assert res.json() == []

    def test_admin_sees_all_pending_applications(self):
        """Admin should see applications regardless of officer assignment."""
        # Create a farmer and submit an application
        farmer_token = _register_and_login("farmer_list@test.com", role="farmer")
        admin_token = _register_and_login("admin_list@test.com", role="admin")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        _create_farmer_application(farmer_token, scheme_id)

        res = client.get("/api/v1/officer/applications", headers=_auth(admin_token))
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_officer_sees_only_assigned_applications(self):
        """Officer should see only applications that are assigned to them."""
        farmer_token = _register_and_login("farmer_assign@test.com", role="farmer")
        officer_token = _register_and_login("officer_assign@test.com", role="officer")
        admin_token = _register_and_login("admin_assign@test.com", role="admin")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        # Before assignment – officer should see empty list
        res = client.get("/api/v1/officer/applications", headers=_auth(officer_token))
        assert res.status_code == 200
        assert res.json() == []

        # Get officer user ID
        me_res = client.get("/api/v1/auth/me", headers=_auth(officer_token))
        officer_id = me_res.json()["id"]

        # Admin assigns the officer
        res = client.post(
            f"/api/v1/officer/assign/{app_id}",
            headers=_auth(admin_token),
            json={"officer_id": officer_id},
        )
        assert res.status_code == 200

        # After assignment – officer should see that application
        res = client.get("/api/v1/officer/applications", headers=_auth(officer_token))
        assert res.status_code == 200
        apps = res.json()
        assert len(apps) == 1
        assert apps[0]["id"] == str(app_id)


# ── Application detail ────────────────────────────────────────────────────────

class TestApplicationDetail:
    def test_get_detail_returns_farmer_and_scheme(self):
        farmer_token = _register_and_login("farmer_det@test.com", role="farmer")
        officer_token = _register_and_login("officer_det@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        res = client.get(f"/api/v1/officer/application/{app_id}", headers=_auth(officer_token))
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == str(app_id)
        assert data["status"] == "pending"
        assert "farmer" in data
        assert "scheme" in data
        assert data["scheme"]["scheme_name"] == "Test Scheme"

    def test_get_detail_nonexistent_returns_404(self):
        officer_token = _register_and_login("officer_404@test.com", role="officer")
        fake_id = uuid.uuid4()
        res = client.get(f"/api/v1/officer/application/{fake_id}", headers=_auth(officer_token))
        assert res.status_code == 404


# ── Approve ───────────────────────────────────────────────────────────────────

class TestApprove:
    def test_approve_pending_application(self):
        farmer_token = _register_and_login("farmer_appr@test.com", role="farmer")
        officer_token = _register_and_login("officer_appr@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        res = client.post(
            f"/api/v1/officer/approve/{app_id}",
            headers=_auth(officer_token),
            json={"notes": "Looks good, all documents verified."},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "approved"
        assert data["decision_date"] is not None
        assert data["notes"] == "Looks good, all documents verified."

    def test_approve_without_notes(self):
        farmer_token = _register_and_login("farmer_appr2@test.com", role="farmer")
        officer_token = _register_and_login("officer_appr2@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        res = client.post(
            f"/api/v1/officer/approve/{app_id}",
            headers=_auth(officer_token),
            json={},
        )
        assert res.status_code == 200
        assert res.json()["status"] == "approved"

    def test_approve_already_approved_returns_409(self):
        """Cannot approve an already-approved application."""
        farmer_token = _register_and_login("farmer_appr3@test.com", role="farmer")
        officer_token = _register_and_login("officer_appr3@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        # First approval
        client.post(f"/api/v1/officer/approve/{app_id}", headers=_auth(officer_token), json={})

        # Second approval attempt
        res = client.post(f"/api/v1/officer/approve/{app_id}", headers=_auth(officer_token), json={})
        assert res.status_code == 409

    def test_approve_nonexistent_returns_404(self):
        officer_token = _register_and_login("officer_appr4@test.com", role="officer")
        fake_id = uuid.uuid4()
        res = client.post(f"/api/v1/officer/approve/{fake_id}", headers=_auth(officer_token), json={})
        assert res.status_code == 404

    def test_farmer_cannot_approve(self):
        farmer_token = _register_and_login("farmer_noappr@test.com", role="farmer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        res = client.post(
            f"/api/v1/officer/approve/{app_id}",
            headers=_auth(farmer_token),
            json={},
        )
        assert res.status_code == 403


# ── Reject ────────────────────────────────────────────────────────────────────

class TestReject:
    def test_reject_pending_application_with_reason(self):
        farmer_token = _register_and_login("farmer_rej@test.com", role="farmer")
        officer_token = _register_and_login("officer_rej@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        res = client.post(
            f"/api/v1/officer/reject/{app_id}",
            headers=_auth(officer_token),
            json={"reason": "Documents are incomplete."},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "rejected"
        assert data["decision_date"] is not None
        assert data["notes"] == "Documents are incomplete."

    def test_reject_without_reason_returns_422(self):
        """Rejection without a reason must be refused by the service."""
        farmer_token = _register_and_login("farmer_rej2@test.com", role="farmer")
        officer_token = _register_and_login("officer_rej2@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        # Pydantic will reject missing `reason` field with 422
        res = client.post(
            f"/api/v1/officer/reject/{app_id}",
            headers=_auth(officer_token),
            json={},
        )
        assert res.status_code == 422

    def test_reject_already_rejected_returns_409(self):
        farmer_token = _register_and_login("farmer_rej3@test.com", role="farmer")
        officer_token = _register_and_login("officer_rej3@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        client.post(
            f"/api/v1/officer/reject/{app_id}",
            headers=_auth(officer_token),
            json={"reason": "First rejection."},
        )
        res = client.post(
            f"/api/v1/officer/reject/{app_id}",
            headers=_auth(officer_token),
            json={"reason": "Second rejection attempt."},
        )
        assert res.status_code == 409

    def test_reject_approved_application_returns_409(self):
        """An approved application must not be rejectable."""
        farmer_token = _register_and_login("farmer_rej4@test.com", role="farmer")
        officer_token = _register_and_login("officer_rej4@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        client.post(f"/api/v1/officer/approve/{app_id}", headers=_auth(officer_token), json={})
        res = client.post(
            f"/api/v1/officer/reject/{app_id}",
            headers=_auth(officer_token),
            json={"reason": "Changed my mind."},
        )
        assert res.status_code == 409


# ── Request document ──────────────────────────────────────────────────────────

class TestRequestDocument:
    def test_request_document_on_pending_application(self):
        farmer_token = _register_and_login("farmer_doc@test.com", role="farmer")
        officer_token = _register_and_login("officer_doc@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        res = client.post(
            f"/api/v1/officer/request-document/{app_id}",
            headers=_auth(officer_token),
            json={"document_request": "Please provide land ownership certificate."},
        )
        assert res.status_code == 200
        data = res.json()
        # Status remains pending
        assert data["status"] == "pending"
        # The note was appended
        assert "land ownership certificate" in data["notes"]
        assert "[Document Request]" in data["notes"]

    def test_request_document_twice_appends_both_notes(self):
        """Multiple document requests should accumulate in the notes field."""
        farmer_token = _register_and_login("farmer_doc2@test.com", role="farmer")
        officer_token = _register_and_login("officer_doc2@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        client.post(
            f"/api/v1/officer/request-document/{app_id}",
            headers=_auth(officer_token),
            json={"document_request": "Provide Aadhar card."},
        )
        res = client.post(
            f"/api/v1/officer/request-document/{app_id}",
            headers=_auth(officer_token),
            json={"document_request": "Provide bank statement."},
        )
        assert res.status_code == 200
        notes = res.json()["notes"]
        assert "Aadhar card" in notes
        assert "bank statement" in notes

    def test_request_document_empty_body_returns_422(self):
        farmer_token = _register_and_login("farmer_doc3@test.com", role="farmer")
        officer_token = _register_and_login("officer_doc3@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        res = client.post(
            f"/api/v1/officer/request-document/{app_id}",
            headers=_auth(officer_token),
            json={},
        )
        # Pydantic will reject missing document_request field
        assert res.status_code == 422

    def test_request_document_on_approved_application_returns_409(self):
        """Cannot request documents on a non-pending application."""
        farmer_token = _register_and_login("farmer_doc4@test.com", role="farmer")
        officer_token = _register_and_login("officer_doc4@test.com", role="officer")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        # Approve first
        client.post(f"/api/v1/officer/approve/{app_id}", headers=_auth(officer_token), json={})

        res = client.post(
            f"/api/v1/officer/request-document/{app_id}",
            headers=_auth(officer_token),
            json={"document_request": "Too late."},
        )
        assert res.status_code == 409


# ── Admin assign ──────────────────────────────────────────────────────────────

class TestAssignOfficer:
    def test_admin_can_assign_officer(self):
        farmer_token = _register_and_login("farmer_asgn@test.com", role="farmer")
        officer_token = _register_and_login("officer_asgn@test.com", role="officer")
        admin_token = _register_and_login("admin_asgn@test.com", role="admin")

        db = _get_db_session()
        scheme_id = _create_scheme(db)
        db.close()

        app_id = _create_farmer_application(farmer_token, scheme_id)

        officer_id = client.get("/api/v1/auth/me", headers=_auth(officer_token)).json()["id"]

        res = client.post(
            f"/api/v1/officer/assign/{app_id}",
            headers=_auth(admin_token),
            json={"officer_id": officer_id},
        )
        assert res.status_code == 200
        assert res.json()["assigned_officer"] == officer_id

    def test_officer_cannot_use_assign_endpoint(self):
        officer_token = _register_and_login("officer_noasgn@test.com", role="officer")
        fake_app_id = uuid.uuid4()
        fake_officer_id = uuid.uuid4()

        res = client.post(
            f"/api/v1/officer/assign/{fake_app_id}",
            headers=_auth(officer_token),
            json={"officer_id": str(fake_officer_id)},
        )
        assert res.status_code == 403
