from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException
from typing import List, Optional
from datetime import datetime, timezone

from app.repositories.farmer_repo import (
    FarmerRepository, FarmRepository, CropHistoryRepository,
    SubsidyApplicationRepository, SubsidySchemeRepository
)
from app.services.eligibility_engine import EligibilityEngine
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.subsidy_scheme import SubsidyScheme
from app.models.subsidy_application import SubsidyApplication
from app.schemas.farmer import FarmerCreate, FarmerBase
from app.schemas.farm import FarmCreate, FarmBase
from app.schemas.crop_history import CropHistoryCreate
from app.schemas.subsidy_application import SubsidyApplicationCreate

class FarmerService:
    def __init__(self, db: Session):
        self.db = db
        self.farmer_repo = FarmerRepository(db)
        self.farm_repo = FarmRepository(db)
        self.crop_history_repo = CropHistoryRepository(db)
        self.application_repo = SubsidyApplicationRepository(db)
        self.scheme_repo = SubsidySchemeRepository(db)
        self.engine = EligibilityEngine()

    def get_profile(self, user_id: UUID) -> Optional[Farmer]:
        return self.farmer_repo.get_by_user_id(user_id)

    def create_or_update_profile(self, user_id: UUID, profile_data: FarmerBase) -> Farmer:
        existing = self.farmer_repo.get_by_user_id(user_id)
        if existing:
            return self.farmer_repo.update(existing, profile_data.model_dump())
        else:
            create_data = FarmerCreate(**profile_data.model_dump(), user_id=user_id)
            return self.farmer_repo.create(create_data)

    def get_farm(self, farmer_id: UUID) -> Optional[Farm]:
        return self.farm_repo.get_by_farmer_id(farmer_id)

    def add_or_update_farm(self, farmer_id: UUID, farm_data: FarmBase) -> Farm:
        existing = self.farm_repo.get_by_farmer_id(farmer_id)
        if existing:
            return self.farm_repo.update(existing, farm_data.model_dump())
        else:
            create_data = FarmCreate(**farm_data.model_dump(), farmer_id=farmer_id)
            return self.farm_repo.create(create_data)

    def get_crop_history(self, farmer_id: UUID):
        return self.crop_history_repo.list_by_farmer_id(farmer_id)

    def add_crop_history(self, farmer_id: UUID, crop_data: CropHistoryCreate):
        crop_data.farmer_id = farmer_id
        return self.crop_history_repo.create(crop_data)

    def get_eligible_subsidies(self, user_id: UUID) -> List[SubsidyScheme]:
        farmer = self.get_profile(user_id)
        if not farmer:
            raise HTTPException(status_code=400, detail="Farmer profile not found")
        
        farm = self.get_farm(farmer.id)
        all_schemes = self.scheme_repo.list_active_schemes()
        eligible = self.engine.get_eligible_schemes(farmer, farm, all_schemes)
        return eligible

    def get_all_schemes_with_eligibility(self, user_id: UUID) -> List[dict]:
        """Returns ALL active schemes along with eligibility status and reasons."""
        farmer = self.get_profile(user_id)
        farm = self.get_farm(farmer.id) if farmer else None
        
        all_schemes = self.scheme_repo.list_active_schemes()
        existing_apps = []
        if farmer:
            existing_apps = self.application_repo.list_by_farmer_id(farmer.id)
        
        results = []
        for scheme in all_schemes:
            if not farmer:
                is_eligible, reasons = False, ["Farmer profile incomplete. Please update your profile first."]
            else:
                is_eligible, reasons = self.engine.evaluate_scheme_with_reasons(scheme, farmer, farm)
            
            app = next((a for a in existing_apps if a.scheme_id == scheme.id), None)
            
            results.append({
                "scheme": scheme,
                "is_eligible": is_eligible,
                "ineligible_reasons": reasons,
                "already_applied": app is not None,
                "application_id": app.id if app else None,
                "application_status": app.status.value if app else None
            })
            
        return results

    def apply_for_subsidy(self, user_id: UUID, app_data: SubsidyApplicationCreate) -> SubsidyApplication:
        farmer = self.get_profile(user_id)
        if not farmer:
            raise HTTPException(status_code=400, detail="Farmer profile not found")
            
        farm = self.get_farm(farmer.id)
        
        scheme = self.scheme_repo.get_by_id(app_data.scheme_id)
        if not scheme or not scheme.is_active:
            raise HTTPException(status_code=404, detail="Subsidy scheme not found or inactive")

        # Check deadline
        if scheme.application_deadline and scheme.application_deadline < datetime.now(tz=timezone.utc):
            raise HTTPException(status_code=400, detail="Application deadline has passed")

        # Check max beneficiaries
        if scheme.max_beneficiaries:
            # We would normally query a count of approved applications here
            approved_count = self.db.query(SubsidyApplication).filter(
                SubsidyApplication.scheme_id == scheme.id,
                SubsidyApplication.status == "approved"
            ).count()
            if approved_count >= scheme.max_beneficiaries:
                raise HTTPException(status_code=400, detail="Maximum beneficiaries reached for this scheme")

        # Check if already applied
        existing_apps = self.application_repo.list_by_farmer_id(farmer.id)
        if any(app.scheme_id == app_data.scheme_id for app in existing_apps):
            raise HTTPException(status_code=400, detail="Already applied for this scheme")

        # Validate eligibility
        is_eligible, _ = self.engine.evaluate_scheme_with_reasons(scheme, farmer, farm)
        if not is_eligible:
            raise HTTPException(status_code=403, detail="Not eligible for this scheme")

        app_data.farmer_id = farmer.id
        return self.application_repo.create(app_data)

    def get_applications(self, user_id: UUID) -> List[SubsidyApplication]:
        farmer = self.get_profile(user_id)
        if not farmer:
            raise HTTPException(status_code=400, detail="Farmer profile not found")
        # Ensure scheme is loaded for the frontend
        apps = self.application_repo.list_by_farmer_id(farmer.id)
        for app in apps:
            _ = app.scheme # Force lazy load
        return apps
