from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Any, List
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
from pydantic import BaseModel

router = APIRouter(
    dependencies=[Depends(get_current_user), Depends(require_role(UserRole.farmer))]
)

def get_farmer_service(db: Session = Depends(get_db)):
    return FarmerService(db)

@router.post("/profile", response_model=FarmerOut)
def create_or_update_profile(
    profile_data: FarmerBase,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Create or update farmer profile."""
    return service.create_or_update_profile(current_user.id, profile_data)

@router.get("/profile", response_model=FarmerOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
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
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Add or update farm details."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Please create a profile first")
    return service.add_or_update_farm(profile.id, farm_data)

@router.get("/farm", response_model=FarmOut)
def get_farm(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Get farm details."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    farm = service.get_farm(profile.id)
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm

@router.post("/crop-history", response_model=CropHistoryOut)
def add_crop_history(
    crop_data: CropHistoryBase,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Add a crop history entry."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Please create a profile first")
    
    # We use a trick here: CropHistoryCreate needs farmer_id
    from app.schemas.crop_history import CropHistoryCreate
    create_data = CropHistoryCreate(**crop_data.model_dump(), farmer_id=profile.id)
    return service.add_crop_history(profile.id, create_data)

@router.get("/crop-history", response_model=List[CropHistoryOut])
def list_crop_history(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Get crop history."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return service.get_crop_history(profile.id)

@router.get("/subsidies", response_model=List[SubsidySchemeOut])
def get_eligible_subsidies(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Get eligible subsidies for the farmer."""
    return service.get_eligible_subsidies(current_user.id)

class ApplicationRequest(BaseModel):
    scheme_id: uuid.UUID

@router.post("/apply", response_model=SubsidyApplicationOut)
def apply_for_subsidy(
    req: ApplicationRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Submit a subsidy application."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")
        
    app_data = SubsidyApplicationCreate(
        farmer_id=profile.id,
        scheme_id=req.scheme_id
    )
    return service.apply_for_subsidy(current_user.id, app_data)

@router.get("/applications", response_model=List[SubsidyApplicationOut])
def get_applications(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """List all applications submitted by the farmer."""
    return service.get_applications(current_user.id)

@router.post("/upload-document")
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Handle document upload."""
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    filename = f"{uuid.uuid4()}_{int(time.time())}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        
    # In a real app we'd return a full URL or S3 path
    return {"url": f"/uploads/{filename}", "filename": file.filename}

class SoilSourceEnum(str, Enum):
    auto = "auto"
    manual = "manual"

class CropRecommendRequest(BaseModel):
    state: str | None = None
    district: str | None = None
    village: str | None = None
    season: str
    soil_source: SoilSourceEnum
    nitrogen: float | None = None
    phosphorus: float | None = None
    potassium: float | None = None
    ph: float | None = None

class YieldPredictRequest(BaseModel):
    crop: str
    season: str
    state: str | None = None
    area: float
    irrigation_type: str | None = None

@router.get("/location-data")
def get_location_data(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Get the farmer's stored location details."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "state": profile.state,
        "district": profile.district,
        "village": profile.village,
        "soil_type": profile.soil_type
    }

@router.get("/crop-input-data")
def get_crop_input_data(
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service)
) -> Any:
    """Return all available data for the farmer's crop input form."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "profile": {
            "state": profile.state,
            "district": profile.district,
            "village": profile.village,
            "soil_type": profile.soil_type
        },
        "soil_data_options": {
            "auto": {
                "available": True,
                "message": "Regional average data available for your location"
            },
            "manual": {
                "available": True,
                "message": "Enter your soil test values manually"
            }
        },
        "seasons": ["Kharif", "Rabi", "Summer"],
        "current_season": "Kharif"
    }

@router.get("/soil-data-preview")
def get_soil_data_preview(
    season: str,
    state: str | None = None,
    district: str | None = None,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
    db: Session = Depends(get_db)
) -> Any:
    """Preview auto-filled soil data."""
    profile = service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")
        
    loc_state = state or profile.state
    loc_district = district or profile.district
    
    if not loc_state or not loc_district:
        raise HTTPException(status_code=400, detail="Location data (state and district) is required.")

    soil_service = SoilDataService(db)
    soil_data = soil_service.get_soil_data_by_location(
        state=loc_state, district=loc_district, village=profile.village, season=season
    )
    
    if not soil_data:
        raise HTTPException(status_code=404, detail="Regional soil data not found for this location.")
        
    data_source = soil_data.pop("data_source", "Unknown")
    
    return {
        "location": {
            "state": loc_state,
            "district": loc_district,
            "village": profile.village
        },
        "soil_data": soil_data,
        "data_source": data_source,
        "season": season,
        "message": "These values are regional averages. For more accurate results, consider soil testing."
    }

@router.post("/crop-recommend")
def crop_recommend(
    req: CropRecommendRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
    db: Session = Depends(get_db)
) -> Any:
    profile = service.get_profile(current_user.id)
    loc_state = req.state or (profile.state if profile else None)
    loc_district = req.district or (profile.district if profile else None)
    loc_village = req.village or (profile.village if profile else None)

    soil_service = SoilDataService(db)
    regional_data = soil_service.get_soil_data_by_location(
        state=loc_state, district=loc_district, village=loc_village, season=req.season
    )
    
    if not regional_data:
        raise HTTPException(status_code=400, detail="Regional data not available for this location to fetch weather/soil baselines.")
        
    if req.soil_source == SoilSourceEnum.auto:
        # Use auto data
        return MLService.predict_crop(
            nitrogen=regional_data["nitrogen"],
            phosphorus=regional_data["phosphorus"],
            potassium=regional_data["potassium"],
            ph=regional_data["ph"],
            temperature=regional_data["temperature"],
            humidity=regional_data["humidity"],
            rainfall=regional_data["rainfall"],
            source="auto"
        )
    elif req.soil_source == SoilSourceEnum.manual:
        # Validate manual data
        manual_data = {
            "nitrogen": req.nitrogen,
            "phosphorus": req.phosphorus,
            "potassium": req.potassium,
            "ph": req.ph
        }
        is_valid, error = ValidationService.validate_manual_soil_data(manual_data)
        if not is_valid:
            # The exact response schema for validation error
            raise HTTPException(status_code=400, detail=error)
            
        return MLService.predict_crop(
            nitrogen=req.nitrogen,
            phosphorus=req.phosphorus,
            potassium=req.potassium,
            ph=req.ph,
            temperature=regional_data["temperature"],
            humidity=regional_data["humidity"],
            rainfall=regional_data["rainfall"],
            source="manual"
        )

@router.post("/yield-predict")
def yield_predict(
    req: YieldPredictRequest,
    current_user: User = Depends(get_current_user),
    service: FarmerService = Depends(get_farmer_service),
    db: Session = Depends(get_db)
) -> Any:
    profile = service.get_profile(current_user.id)
    loc_state = req.state or (profile.state if profile else None)
    loc_district = profile.district if profile else None
    
    soil_service = SoilDataService(db)
    regional_data = soil_service.get_soil_data_by_location(
        state=loc_state, district=loc_district, season=req.season
    )
    
    temperature = regional_data["temperature"] if regional_data else 25.0
    rainfall = regional_data["rainfall"] if regional_data else 1000.0
    
    return MLService.predict_yield(
        crop=req.crop,
        season=req.season,
        state=loc_state,
        area=req.area,
        rainfall=rainfall,
        temperature=temperature,
        irrigation=req.irrigation_type
    )
