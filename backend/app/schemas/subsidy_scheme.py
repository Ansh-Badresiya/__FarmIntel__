from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class SubsidySchemeBase(BaseModel):
    scheme_name: str
    description: Optional[str] = None
    subsidy_amount: float
    applicable_states: List[str] = []
    applicable_seasons: List[str] = []
    is_active: bool = True

class SubsidySchemeCreate(SubsidySchemeBase):
    pass

class SubsidySchemeOut(SubsidySchemeBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None

    class Config:
        from_attributes = True
