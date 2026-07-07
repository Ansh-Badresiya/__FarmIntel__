from pydantic import BaseModel, validator
from uuid import UUID
from datetime import datetime, date
from typing import Optional

class FarmerBase(BaseModel):
    # Identity
    aadhar_number: str
    pan_number: Optional[str] = None
    father_name: Optional[str] = None
    gender: Optional[str] = None          # Male / Female / Other
    date_of_birth: Optional[date] = None
    age: Optional[int] = None
    category: Optional[str] = None        # General / OBC / SC / ST

    # Contact
    phone_number: Optional[str] = None

    # Address
    address: Optional[str] = None
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None

    # Bank
    bank_account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

    # Socio-economic
    annual_income: Optional[float] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    farmer_type: Optional[str] = None    # Small / Marginal / Medium / Large
    land_ownership: Optional[str] = None # Owned / Leased / Joint

    # Legacy
    soil_type: Optional[str] = None

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
