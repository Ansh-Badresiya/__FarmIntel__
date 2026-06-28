"""
Pydantic schemas for Officer-specific request/response models.
"""
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict

from app.models.subsidy_application import ApplicationStatus


# ── Request Payloads ──────────────────────────────────────────────────────────

class ApproveApplicationRequest(BaseModel):
    notes: Optional[str] = None


class RejectApplicationRequest(BaseModel):
    reason: str  # reason is mandatory for a rejection


class RequestDocumentRequest(BaseModel):
    document_request: str  # description of the document(s) needed


class AssignOfficerRequest(BaseModel):
    officer_id: UUID


# ── Response Models ───────────────────────────────────────────────────────────

class FarmerDetailOut(BaseModel):
    id: UUID
    aadhar_number: str
    age: Optional[int] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True


class SchemeDetailOut(BaseModel):
    id: UUID
    scheme_name: str
    description: Optional[str] = None
    subsidy_amount: float

    class Config:
        from_attributes = True


class ApplicationDetailOut(BaseModel):
    """Rich response for a single application including farmer and scheme info."""
    id: UUID
    status: ApplicationStatus
    application_date: datetime
    decision_date: Optional[datetime] = None
    assigned_officer: Optional[UUID] = None
    notes: Optional[str] = None
    documents: Optional[Dict[str, Any]] = None
    farmer: FarmerDetailOut
    scheme: SchemeDetailOut

    class Config:
        from_attributes = True


class ApplicationListOut(BaseModel):
    """Lighter response for the list endpoint."""
    id: UUID
    status: ApplicationStatus
    application_date: datetime
    decision_date: Optional[datetime] = None
    assigned_officer: Optional[UUID] = None
    notes: Optional[str] = None
    farmer_id: UUID
    scheme_id: UUID

    class Config:
        from_attributes = True
