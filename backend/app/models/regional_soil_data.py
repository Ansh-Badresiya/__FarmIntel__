import uuid
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.session import Base

class RegionalSoilData(Base):
    __tablename__ = "regional_soil_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    avg_nitrogen = Column(Float)
    avg_phosphorus = Column(Float)
    avg_potassium = Column(Float)
    avg_ph = Column(Float)
    avg_temperature = Column(Float)
    avg_humidity = Column(Float)
    avg_rainfall = Column(Float)
    season = Column(String(20), index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
