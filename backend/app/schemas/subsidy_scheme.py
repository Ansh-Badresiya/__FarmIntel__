from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional, Any, Dict

class SubsidySchemeBase(BaseModel):
    scheme_name: str
    description: Optional[str] = None
    subsidy_amount: float
    applicable_states: List[str] = []
    applicable_seasons: List[str] = []
    is_active: bool = True
    application_deadline: Optional[datetime] = None
    max_beneficiaries: Optional[int] = None
    banner_url: Optional[str] = None
    scheme_documents: Optional[List[Dict[str, Any]]] = None

class SubsidySchemeCreate(SubsidySchemeBase):
    pass

class SubsidySchemeOut(SubsidySchemeBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None

    class Config:
        from_attributes = True

class SchemeWithEligibilityOut(BaseModel):
    """Response model for the 'all schemes with eligibility' endpoint."""
    scheme: SubsidySchemeOut
    is_eligible: bool
    ineligible_reasons: List[str] = []
    already_applied: bool = False
    application_id: Optional[UUID] = None
    application_status: Optional[str] = None

    class Config:
        from_attributes = True
