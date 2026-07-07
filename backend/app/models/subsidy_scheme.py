import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class SubsidyScheme(Base):
    __tablename__ = "subsidy_schemes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    scheme_name = Column(String, nullable=False, unique=True, index=True)
    description = Column(String, nullable=True)
    subsidy_amount = Column(Float, nullable=False)
    applicable_states = Column(ARRAY(String), default=[])
    applicable_seasons = Column(ARRAY(String), default=[])
    is_active = Column(Boolean, default=True)

    # New government portal fields
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    max_beneficiaries = Column(Integer, nullable=True)
    banner_url = Column(String, nullable=True)
    scheme_documents = Column(JSONB, nullable=True)   # list of {name, url} dicts

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Relationships
    creator = relationship("User", back_populates="schemes_created")
    rules = relationship("EligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    applications = relationship("SubsidyApplication", back_populates="scheme")
