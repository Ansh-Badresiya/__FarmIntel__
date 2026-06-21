from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.models.crop_history import Season

class CropHistoryBase(BaseModel):
    crop_name: str
    season: Season
    year: int
    production: Optional[float] = None

class CropHistoryCreate(CropHistoryBase):
    farmer_id: UUID

class CropHistoryOut(CropHistoryBase):
    id: UUID
    farmer_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
