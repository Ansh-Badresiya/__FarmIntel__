import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=False)

    # Identity
    farm_name = Column(String, nullable=True)
    survey_number = Column(String, nullable=True)

    # Land
    land_area = Column(Float, nullable=True)          # total land in hectares
    cultivable_area = Column(Float, nullable=True)    # cultivable area in hectares
    ownership_type = Column(String, nullable=True)    # Owned / Leased / Joint

    # Soil & Water
    soil_type = Column(String, nullable=True)
    soil_ph = Column(Float, nullable=True)
    water_source = Column(String, nullable=True)
    irrigation_type = Column(String, nullable=True)

    # Crops
    crop_type = Column(String, nullable=True)         # primary crop
    secondary_crop = Column(String, nullable=True)
    crop_category = Column(String, nullable=True)     # Cereals / Oilseeds / Pulses / etc.
    season = Column(String, nullable=True)            # Kharif / Rabi / Summer

    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Other
    organic_farming = Column(Boolean, default=False, nullable=True)
    fertilizer_usage = Column(String, nullable=True)
    livestock = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    farmer = relationship("Farmer", back_populates="farms")
