import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class SubsidyApplication(Base):
    __tablename__ = "subsidy_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=False)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("subsidy_schemes.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.pending)
    application_date = Column(DateTime(timezone=True), server_default=func.now())
    decision_date = Column(DateTime(timezone=True))
    assigned_officer = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(String)
    documents = Column(JSONB)

    # Relationships
    farmer = relationship("Farmer", back_populates="applications")
    scheme = relationship("SubsidyScheme", back_populates="applications")
    assigned_officer_rel = relationship("User", back_populates="assigned_applications")
