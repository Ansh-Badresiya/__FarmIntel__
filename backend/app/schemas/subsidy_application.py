from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict
from app.models.subsidy_application import ApplicationStatus

class SubsidyApplicationBase(BaseModel):
    status: ApplicationStatus = ApplicationStatus.pending
    notes: Optional[str] = None
    documents: Optional[Dict[str, Any]] = None

class SubsidyApplicationCreate(SubsidyApplicationBase):
    farmer_id: UUID
    scheme_id: UUID

class SubsidyApplicationOut(SubsidyApplicationBase):
    id: UUID
    farmer_id: UUID
    scheme_id: UUID
    application_date: datetime
    decision_date: Optional[datetime] = None
    assigned_officer: Optional[UUID] = None

    class Config:
        from_attributes = True
