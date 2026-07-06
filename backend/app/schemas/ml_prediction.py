from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Dict, List, Optional


# ─────────────────────────────────────────────────────────────────────────────
# Generic ML prediction (existing — unchanged)
# ─────────────────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Crop Category Prediction (XGBoost)
# ─────────────────────────────────────────────────────────────────────────────

class CropCategoryResult(BaseModel):
    """A single ranked crop-category prediction."""
    rank: int
    category: str
    probability: float


class CropCategoryResponse(BaseModel):
    """Stage 1 response — Top-K predicted crop categories."""
    state: str
    district: str
    season: str
    year: int
    top_categories: List[CropCategoryResult]


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Historical Crop Lookup
# ─────────────────────────────────────────────────────────────────────────────

class CropResult(BaseModel):
    """A single ranked crop from historical frequency lookup."""
    rank: int
    crop: str
    frequency: int
    probability: float


class CropsByCategoryResponse(BaseModel):
    """Stage 2 response — Top-K crops for a given category."""
    state: str
    district: str
    season: str
    category: str
    lookup_scope: str          # "district" or "state" (fallback)
    top_crops: List[CropResult]
    message: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — Yield Prediction (Random Forest)
# ─────────────────────────────────────────────────────────────────────────────

class YieldPredictionResponse(BaseModel):
    """Stage 3 response — predicted crop yield."""
    state: str
    district: str
    season: str
    year: int
    crop: str
    crop_category: str
    predicted_yield_kg_per_ha: float
    unit: str = "kg/ha"
