import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("farmers.id"), nullable=False)
    prediction_type = Column(String, nullable=False) # e.g. "crop", "yield"
    input_features = Column(JSONB, nullable=False)
    prediction_result = Column(JSONB, nullable=False)
    confidence_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    farmer = relationship("Farmer", back_populates="ml_predictions")
