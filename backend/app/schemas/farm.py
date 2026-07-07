from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class FarmBase(BaseModel):
    # Identity
    farm_name: Optional[str] = None
    survey_number: Optional[str] = None

    # Land
    land_area: Optional[float] = None          # total land in hectares
    cultivable_area: Optional[float] = None    # cultivable area in hectares
    ownership_type: Optional[str] = None       # Owned / Leased / Joint

    # Soil & Water
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    water_source: Optional[str] = None
    irrigation_type: Optional[str] = None

    # Crops
    crop_type: Optional[str] = None            # primary crop
    secondary_crop: Optional[str] = None
    crop_category: Optional[str] = None        # Cereals / Oilseeds / Pulses / etc.
    season: Optional[str] = None               # Kharif / Rabi / Summer

    # Location
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Other
    organic_farming: Optional[bool] = False
    fertilizer_usage: Optional[str] = None
    livestock: Optional[str] = None

class FarmCreate(FarmBase):
    farmer_id: UUID

class FarmOut(FarmBase):
    id: UUID
    farmer_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
