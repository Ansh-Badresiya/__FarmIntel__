from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class FarmerBase(BaseModel):
    aadhar_number: str
    age: Optional[int] = None
    phone_number: Optional[str] = None
    village: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None

class FarmerCreate(FarmerBase):
    user_id: UUID

class FarmerOut(FarmerBase):
    id: UUID
    user_id: UUID
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
