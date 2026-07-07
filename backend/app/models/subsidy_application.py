import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    need_info = "need_info"                 # Officer requested more information
    under_verification = "under_verification"  # Field inspection in progress

class SubsidyApplication(Base):
    __tablename__ = "subsidy_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=False)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("subsidy_schemes.id"), nullable=False)
    status = Column(Enum(ApplicationStatus, name="applicationstatus"), default=ApplicationStatus.pending)
    application_date = Column(DateTime(timezone=True), server_default=func.now())
    decision_date = Column(DateTime(timezone=True), nullable=True)
    assigned_officer = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    documents = Column(JSONB, nullable=True)
    inspection_status = Column(String, nullable=True)   # e.g. "Pending", "Completed", "Not Required"
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    farmer = relationship("Farmer", back_populates="applications")
    scheme = relationship("SubsidyScheme", back_populates="applications")
    assigned_officer_rel = relationship("User", back_populates="assigned_applications")
