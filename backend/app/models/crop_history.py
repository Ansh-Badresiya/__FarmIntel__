import uuid
import enum
from sqlalchemy import Column, String, DateTime, Float, Integer, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Season(str, enum.Enum):
    kharif = "Kharif"
    rabi = "Rabi"
    summer = "Summer"

class CropHistory(Base):
    __tablename__ = "crop_histories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=False)
    crop_name = Column(String, nullable=False)
    season = Column(Enum(Season), nullable=False)
    year = Column(Integer, nullable=False)
    production = Column(Float) # in tons
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farmer = relationship("Farmer", back_populates="crop_histories")
