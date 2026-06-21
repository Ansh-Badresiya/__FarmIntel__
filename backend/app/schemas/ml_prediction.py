from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Dict, Optional

class MLPredictionBase(BaseModel):
    prediction_type: str
    input_features: Dict[str, Any]
    prediction_result: Dict[str, Any]
    confidence_score: Optional[float] = None

class MLPredictionCreate(MLPredictionBase):
    farmer_id: UUID

class MLPredictionOut(MLPredictionBase):
    id: UUID
    farmer_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
