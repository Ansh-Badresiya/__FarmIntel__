import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    # Identity
    aadhar_number = Column(String, unique=True, nullable=False, index=True)
    pan_number = Column(String, unique=True, nullable=True)
    father_name = Column(String, nullable=True)
    gender = Column(String, nullable=True)          # Male / Female / Other
    date_of_birth = Column(Date, nullable=True)
    age = Column(Integer, nullable=True)            # kept for eligibility rules & backward compat
    category = Column(String, nullable=True)        # General / OBC / SC / ST

    # Contact
    phone_number = Column(String, nullable=True)

    # Address
    address = Column(String, nullable=True)
    village = Column(String, nullable=True)
    taluka = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)

    # Bank
    bank_account_number = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)

    # Socio-economic
    annual_income = Column(Float, nullable=True)
    education = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    farmer_type = Column(String, nullable=True)     # Small / Marginal / Medium / Large
    land_ownership = Column(String, nullable=True)  # Owned / Leased / Joint

    # Legacy — soil_type moved to Farm; kept for backward compat
    soil_type = Column(String, nullable=True)

    # Status
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="farmer_profile")
    farms = relationship("Farm", back_populates="farmer")
    crop_histories = relationship("CropHistory", back_populates="farmer")
    applications = relationship("SubsidyApplication", back_populates="farmer")
    ml_predictions = relationship("MLPrediction", back_populates="farmer")
