import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    aadhar_number = Column(String, unique=True, nullable=False, index=True)
    age = Column(Integer)
    phone_number = Column(String)
    village = Column(String)
    address = Column(String)
    district = Column(String)
    state = Column(String)
    postal_code = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="farmer_profile")
    farms = relationship("Farm", back_populates="farmer")
    crop_histories = relationship("CropHistory", back_populates="farmer")
    applications = relationship("SubsidyApplication", back_populates="farmer")
    ml_predictions = relationship("MLPrediction", back_populates="farmer")
