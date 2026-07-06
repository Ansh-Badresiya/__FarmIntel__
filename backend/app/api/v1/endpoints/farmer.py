from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Any, List, Optional
import uuid
import os
import time
from enum import Enum

from app.services.soil_data_service import SoilDataService
from app.services.validation_service import ValidationService
from app.services.ml_service import MLService

from app.db.session import get_db
from app.models.user import User, UserRole
from app.api.dependencies import get_current_user, require_role
from app.services.farmer_service import FarmerService

from app.schemas.farmer import FarmerBase, FarmerOut
from app.schemas.farm import FarmBase, FarmOut
from app.schemas.crop_history import CropHistoryBase, CropHistoryOut
from app.schemas.subsidy_application import SubsidyApplicationCreate, SubsidyApplicationOut
from app.schemas.subsidy_scheme import SubsidySchemeOut
from app.schemas.ml_prediction import (
    CropCategoryResponse,
    CropsByCategoryResponse,
    YieldPredictionResponse,
)
from pydantic import BaseModel

router = APIRouter(
    dependencies=[Depends(get_current_user), Depends(require_role(UserRole.farmer))]
)


def get_farmer_service(db: Session = Depends(get_db)):
    return FarmerService(db)


# ─────────────────────────────────────────────────────────────────────────────
# Profile & Farm  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/profile", response_model=FarmerOut)
def create_or_update_profile(
    profile_data: FarmerBase,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Create or update farmer profile."""
    return service.create_or_update_profile(current_user.id, profile_data)


@router.get("/profile", response_model=FarmerOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Get farmer profile."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return profile


@router.post("/farm", response_model=FarmOut)
def add_or_update_farm(
    farm_data: FarmBase,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Add or update farm details."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Please create a profile first")
    return service.add_or_update_farm(profile.id, farm_data)


@router.get("/farm", response_model=FarmOut)
def get_farm(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Get farm details."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    farm = service.get_farm(profile.id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm


# ─────────────────────────────────────────────────────────────────────────────
# Crop History  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/crop-history", response_model=CropHistoryOut)
def add_crop_history(
    crop_data: CropHistoryBase,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Add a crop history entry."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Please create a profile first")

    from app.schemas.crop_history import CropHistoryCreate
    create_data = CropHistoryCreate(**crop_data.model_dump(), farmer_id=profile.id)
    return service.add_crop_history(profile.id, create_data)


@router.get("/crop-history", response_model=List[CropHistoryOut])
def list_crop_history(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Get crop history."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return service.get_crop_history(profile.id)


# ─────────────────────────────────────────────────────────────────────────────
# Subsidies & Applications  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/subsidies", response_model=List[SubsidySchemeOut])
def get_eligible_subsidies(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Get eligible subsidies for the farmer."""
    return service.get_eligible_subsidies(current_user.id)


class ApplicationRequest(BaseModel):
    scheme_id: uuid.UUID


@router.post("/apply", response_model=SubsidyApplicationOut)
def apply_for_subsidy(
    req: ApplicationRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Submit a subsidy application."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    app_data = SubsidyApplicationCreate(
        farmer_id=profile.id,
        scheme_id=req.scheme_id,
    )
    return service.apply_for_subsidy(current_user.id, app_data)


@router.get("/applications", response_model=List[SubsidyApplicationOut])
def get_applications(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """List all applications submitted by the farmer."""
    return service.get_applications(current_user.id)


# ─────────────────────────────────────────────────────────────────────────────
# Document Upload  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/upload-document")
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Handle document upload."""
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    filename = f"{uuid.uuid4()}_{int(time.time())}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"url": f"/uploads/{filename}", "filename": file.filename}


# ─────────────────────────────────────────────────────────────────────────────
# Location & Soil Data helpers  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/location-data")
def get_location_data(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Get the farmer's stored location details."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "state":     profile.state,
        "district":  profile.district,
        "village":   profile.village,
        "soil_type": profile.soil_type,
    }


@router.get("/crop-input-data")
def get_crop_input_data(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """Return all available data for the farmer's crop input form."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "profile": {
            "state":     profile.state,
            "district":  profile.district,
            "village":   profile.village,
            "soil_type": profile.soil_type,
        },
        "seasons": ["Kharif", "Rabi", "Summer", "Whole Year", "Autumn", "Winter"],
        "current_year": __import__("datetime").date.today().year,
    }


@router.get("/soil-data-preview")
def get_soil_data_preview(
    season: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
    db: Session = Depends(get_db),
) -> Any:
    """Preview auto-filled soil data."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")

    loc_state    = state    or profile.state
    loc_district = district or profile.district

    if not loc_state or not loc_district:
        raise HTTPException(
            status_code=400,
            detail="Location data (state and district) is required.",
        )

    soil_service = SoilDataService(db)
    soil_data = soil_service.get_soil_data_by_location(
        state=loc_state, district=loc_district, village=profile.village, season=season
    )

    if not soil_data:
        raise HTTPException(
            status_code=404,
            detail="Regional soil data not found for this location.",
        )

    data_source = soil_data.pop("data_source", "Unknown")

    return {
        "location": {
            "state":    loc_state,
            "district": loc_district,
            "village":  profile.village,
        },
        "soil_data":   soil_data,
        "data_source": data_source,
        "season":      season,
        "message":     "These values are regional averages. For more accurate results, consider soil testing.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Request schemas — ML v2
# ─────────────────────────────────────────────────────────────────────────────

class CropRecommendRequest(BaseModel):
    """
    Stage 1 input.
    District and Year are required for the new XGBoost pipeline.
    State / district fall back to the farmer's saved profile if not supplied.
    """
    state:    Optional[str] = None
    district: Optional[str] = None
    season:   str
    year:     int


class CropsByCategoryRequest(BaseModel):
    """Stage 2 input — historical lookup for a specific category."""
    state:    Optional[str] = None
    district: Optional[str] = None
    season:   str
    category: str           # e.g. "Cereals"


class YieldPredictRequest(BaseModel):
    """Stage 3 input — yield regression."""
    state:         Optional[str] = None
    district:      Optional[str] = None
    season:        str
    year:          int
    crop:          str
    crop_category: str


# ─────────────────────────────────────────────────────────────────────────────
# ML Prediction Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/crop-recommend", response_model=CropCategoryResponse)
def crop_recommend(
    req: CropRecommendRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """
    Stage 1 — XGBoost crop-category prediction.

    Returns the Top-3 crop categories (e.g. Cereals, Oilseeds, Pulses)
    most suitable for the given State / District / Season / Year.
    """
    profile = service.get_profile(current_user.id)

    loc_state    = req.state    or (profile.state    if profile else None)
    loc_district = req.district or (profile.district if profile else None)

    if not loc_state:
        raise HTTPException(status_code=400, detail="State is required. Set it in your profile or pass it in the request.")
    if not loc_district:
        raise HTTPException(status_code=400, detail="District is required. Set it in your profile or pass it in the request.")

    try:
        result = MLService.predict_crop_categories(
            state    = loc_state,
            district = loc_district,
            season   = req.season,
            year     = req.year,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Stage 1 prediction failed: {exc}",
        )

    return result


@router.post("/crop-recommend/crops", response_model=CropsByCategoryResponse)
def crops_by_category(
    req: CropsByCategoryRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """
    Stage 2 — Historical crop lookup.

    For a given crop category (from Stage 1), returns the Top-3 individual
    crops most frequently grown in that State / District / Season.
    Uses crop_train.csv historical data — no ML model involved.
    """
    profile = service.get_profile(current_user.id)

    loc_state    = req.state    or (profile.state    if profile else None)
    loc_district = req.district or (profile.district if profile else None)

    if not loc_state:
        raise HTTPException(status_code=400, detail="State is required.")
    if not loc_district:
        raise HTTPException(status_code=400, detail="District is required.")

    try:
        result = MLService.get_top_crops_for_category(
            state    = loc_state,
            district = loc_district,
            season   = req.season,
            category = req.category,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Stage 2 lookup failed: {exc}",
        )

    return result


@router.post("/yield-predict", response_model=YieldPredictionResponse)
def yield_predict(
    req: YieldPredictRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
) -> Any:
    """
    Stage 3 — Random Forest yield prediction.

    Predicts the expected crop yield (kg/ha) for the given
    State / District / Season / Year / Crop / Crop_Category.
    """
    profile = service.get_profile(current_user.id)

    loc_state    = req.state    or (profile.state    if profile else None)
    loc_district = req.district or (profile.district if profile else None)

    if not loc_state:
        raise HTTPException(status_code=400, detail="State is required.")
    if not loc_district:
        raise HTTPException(status_code=400, detail="District is required.")

    try:
        result = MLService.predict_yield(
            state         = loc_state,
            district      = loc_district,
            season        = req.season,
            year          = req.year,
            crop          = req.crop,
            crop_category = req.crop_category,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Stage 3 prediction failed: {exc}",
        )

    return result
