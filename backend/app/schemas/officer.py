"""
Pydantic schemas for Officer-specific request/response models.
"""
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date
from typing import Optional, Any, Dict, List

from app.models.subsidy_application import ApplicationStatus


# ── Request Payloads ──────────────────────────────────────────────────────────

class ApproveApplicationRequest(BaseModel):
    notes: Optional[str] = None


class RejectApplicationRequest(BaseModel):
    reason: str  # reason is mandatory for a rejection


class RequestDocumentRequest(BaseModel):
    document_request: str  # description of the document(s) needed


class NeedInfoRequest(BaseModel):
    message: str  # description of what info is needed


class AssignOfficerRequest(BaseModel):
    officer_id: UUID


# ── Response Models ───────────────────────────────────────────────────────────

class UserBasicOut(BaseModel):
    """Basic user info for nested responses"""
    full_name: str
    email: str
    
    class Config:
        from_attributes = True


class FarmerDetailOut(BaseModel):
    id: UUID
    user: Optional[UserBasicOut] = None
    aadhar_number: str
    father_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None  # Use date type instead of string
    age: Optional[int] = None
    category: Optional[str] = None
    phone_number: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    annual_income: Optional[float] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    farmer_type: Optional[str] = None
    land_ownership: Optional[str] = None
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    is_verified: bool

    class Config:
        from_attributes = True


class FarmDetailOut(BaseModel):
    id: Optional[UUID] = None
    farm_name: Optional[str] = None
    land_area: Optional[float] = None
    cultivable_area: Optional[float] = None
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    water_source: Optional[str] = None
    irrigation_type: Optional[str] = None
    crop_type: Optional[str] = None
    secondary_crop: Optional[str] = None
    crop_category: Optional[str] = None
    season: Optional[str] = None
    ownership_type: Optional[str] = None
    organic_farming: Optional[bool] = None
    survey_number: Optional[str] = None

    class Config:
        from_attributes = True


class SchemeDetailOut(BaseModel):
    id: UUID
    scheme_name: str
    description: Optional[str] = None
    subsidy_amount: float
    application_deadline: Optional[datetime] = None
    sector: Optional[str] = None  # Not in model, but frontend expects it
    department: Optional[str] = None  # Not in model, but frontend expects it

    class Config:
        from_attributes = True


class ApplicationDetailOut(BaseModel):
    """Rich response for a single application including farmer and scheme info."""
    id: UUID
    status: ApplicationStatus
    application_date: datetime
    decision_date: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    assigned_officer: Optional[UUID] = None
    notes: Optional[str] = None
    documents: Optional[Dict[str, Any]] = None
    inspection_status: Optional[str] = None
    farmer: FarmerDetailOut
    farm: Optional[FarmDetailOut] = None
    scheme: SchemeDetailOut

    class Config:
        from_attributes = True


class ApplicationListOut(BaseModel):
    """Richer list response — includes farmer name and scheme name."""
    id: UUID
    status: ApplicationStatus
    application_date: datetime
    decision_date: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    assigned_officer: Optional[UUID] = None
    notes: Optional[str] = None
    farmer_id: UUID
    scheme_id: UUID
    farmer_name: Optional[str] = None
    farmer_district: Optional[str] = None
    scheme_name: Optional[str] = None

    class Config:
        from_attributes = True
