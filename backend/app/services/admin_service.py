"""
Admin Services — business logic for admin operations.
"""
from uuid import UUID
from typing import List, Optional
from fastapi import HTTPException

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.subsidy_scheme import SubsidyScheme
from app.models.eligibility_rule import EligibilityRule
from app.models.user import User
from app.models.farmer import Farmer
from app.models.subsidy_application import SubsidyApplication, ApplicationStatus

from app.schemas.subsidy_scheme import SubsidySchemeCreate
from app.schemas.eligibility_rule import EligibilityRuleCreate
from app.schemas.admin import SubsidySchemeUpdate, EligibilityRuleUpdate, UserRoleUpdate, DashboardStats


class SubsidyService:
    def __init__(self, db: Session):
        self.db = db

    # --- Schemes ---
    def create_scheme(self, creator_id: UUID, scheme_data: SubsidySchemeCreate) -> SubsidyScheme:
        scheme = SubsidyScheme(**scheme_data.model_dump(), created_by=creator_id)
        self.db.add(scheme)
        self.db.commit()
        self.db.refresh(scheme)
        return scheme

    def update_scheme(self, scheme_id: UUID, update_data: SubsidySchemeUpdate) -> SubsidyScheme:
        scheme = self.db.query(SubsidyScheme).filter(SubsidyScheme.id == scheme_id).first()
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
        
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(scheme, field, value)
            
        self.db.commit()
        self.db.refresh(scheme)
        return scheme

    def delete_scheme(self, scheme_id: UUID) -> SubsidyScheme:
        scheme = self.db.query(SubsidyScheme).filter(SubsidyScheme.id == scheme_id).first()
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
        
        # Soft delete
        scheme.is_active = False
        self.db.commit()
        self.db.refresh(scheme)
        return scheme

    # --- Rules ---
    def add_rule(self, rule_data: EligibilityRuleCreate) -> EligibilityRule:
        scheme = self.db.query(SubsidyScheme).filter(SubsidyScheme.id == rule_data.scheme_id).first()
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")
            
        rule = EligibilityRule(**rule_data.model_dump())
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def update_rule(self, rule_id: UUID, update_data: EligibilityRuleUpdate) -> EligibilityRule:
        rule = self.db.query(EligibilityRule).filter(EligibilityRule.id == rule_id).first()
        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")
            
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(rule, field, value)
            
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def delete_rule(self, rule_id: UUID):
        rule = self.db.query(EligibilityRule).filter(EligibilityRule.id == rule_id).first()
        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")
            
        self.db.delete(rule)
        self.db.commit()


class UserManagementService:
    def __init__(self, db: Session):
        self.db = db

    def list_users(self, role: Optional[str] = None) -> List[User]:
        query = self.db.query(User)
        if role:
            query = query.filter(User.role == role)
        return query.order_by(User.created_at.desc()).all()

    def update_user_role(self, user_id: UUID, role_data: UserRoleUpdate) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.role = role_data.role
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_dashboard_stats(self) -> DashboardStats:
        total_farmers = self.db.query(func.count(Farmer.id)).scalar() or 0
        total_schemes = self.db.query(func.count(SubsidyScheme.id)).filter(SubsidyScheme.is_active == True).scalar() or 0
        
        # Applications counts
        apps_pending = self.db.query(func.count(SubsidyApplication.id)).filter(SubsidyApplication.status == ApplicationStatus.pending).scalar() or 0
        apps_approved = self.db.query(func.count(SubsidyApplication.id)).filter(SubsidyApplication.status == ApplicationStatus.approved).scalar() or 0
        apps_rejected = self.db.query(func.count(SubsidyApplication.id)).filter(SubsidyApplication.status == ApplicationStatus.rejected).scalar() or 0

        return DashboardStats(
            total_farmers=total_farmers,
            applications_pending=apps_pending,
            applications_approved=apps_approved,
            applications_rejected=apps_rejected,
            total_schemes=total_schemes
        )
