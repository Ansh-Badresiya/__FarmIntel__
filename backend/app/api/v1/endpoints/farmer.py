from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Any, List
import uuid
import os
import time

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
