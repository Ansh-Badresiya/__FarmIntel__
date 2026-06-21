import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("subsidy_schemes.id"), nullable=False)
    rule_name = Column(String, nullable=False)
    rule_logic = Column(JSONB, nullable=False)
    priority = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    scheme = relationship("SubsidyScheme", back_populates="rules")
