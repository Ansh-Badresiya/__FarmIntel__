from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class FarmBase(BaseModel):
    land_area: float
    soil_type: Optional[str] = None
    water_source: Optional[str] = None
    ownership_type: Optional[str] = None

class FarmCreate(FarmBase):
    farmer_id: UUID

class FarmOut(FarmBase):
    id: UUID
    farmer_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
