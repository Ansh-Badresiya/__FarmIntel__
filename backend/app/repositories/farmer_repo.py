from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.farmer import Farmer
from app.models.farm import Farm
from app.models.crop_history import CropHistory
from app.models.subsidy_application import SubsidyApplication
from app.models.subsidy_scheme import SubsidyScheme
from app.schemas.farmer import FarmerCreate
from app.schemas.farm import FarmCreate
from app.schemas.crop_history import CropHistoryCreate
from app.schemas.subsidy_application import SubsidyApplicationCreate

class FarmerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: UUID) -> Optional[Farmer]:
        return self.db.query(Farmer).filter(Farmer.user_id == user_id).first()

    def get_by_id(self, farmer_id: UUID) -> Optional[Farmer]:
        return self.db.query(Farmer).filter(Farmer.id == farmer_id).first()

    def create(self, farmer_data: FarmerCreate) -> Farmer:
        db_obj = Farmer(**farmer_data.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Farmer, update_data: dict) -> Farmer:
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

class FarmRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_farmer_id(self, farmer_id: UUID) -> Optional[Farm]:
        return self.db.query(Farm).filter(Farm.farmer_id == farmer_id).first()

    def create(self, farm_data: FarmCreate) -> Farm:
        db_obj = Farm(**farm_data.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: Farm, update_data: dict) -> Farm:
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

class CropHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_farmer_id(self, farmer_id: UUID) -> List[CropHistory]:
        return self.db.query(CropHistory).filter(CropHistory.farmer_id == farmer_id).order_by(CropHistory.year.desc()).all()

    def create(self, crop_data: CropHistoryCreate) -> CropHistory:
        db_obj = CropHistory(**crop_data.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

class SubsidyApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_farmer_id(self, farmer_id: UUID) -> List[SubsidyApplication]:
        return self.db.query(SubsidyApplication).filter(SubsidyApplication.farmer_id == farmer_id).order_by(SubsidyApplication.application_date.desc()).all()

    def create(self, app_data: SubsidyApplicationCreate) -> SubsidyApplication:
        db_obj = SubsidyApplication(**app_data.model_dump())
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

class SubsidySchemeRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_active_schemes(self) -> List[SubsidyScheme]:
        # Also need to join rules or just lazy load. Rules are loaded via relationship
        return self.db.query(SubsidyScheme).filter(SubsidyScheme.is_active == True).all()

    def get_by_id(self, scheme_id: UUID) -> Optional[SubsidyScheme]:
        return self.db.query(SubsidyScheme).filter(SubsidyScheme.id == scheme_id).first()
