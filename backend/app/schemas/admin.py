from typing import List, Optional, Any, Dict
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.models.user import UserRole

# Schemas for Schemes
class SubsidySchemeUpdate(BaseModel):
    scheme_name: Optional[str] = None
    description: Optional[str] = None
    subsidy_amount: Optional[float] = None
    applicable_states: Optional[List[str]] = None
    applicable_seasons: Optional[List[str]] = None
    is_active: Optional[bool] = None
    application_deadline: Optional[datetime] = None
    max_beneficiaries: Optional[int] = None
    banner_url: Optional[str] = None
    scheme_documents: Optional[List[Dict[str, Any]]] = None

# Schemas for Rules
class EligibilityRuleUpdate(BaseModel):
    rule_name: Optional[str] = None
    rule_logic: Optional[dict] = None
    priority: Optional[int] = None

# Schemas for Users
class UserRoleUpdate(BaseModel):
    role: UserRole

class DashboardStats(BaseModel):
    total_farmers: int
    total_officers: int
    applications_pending: int
    applications_approved: int
    applications_rejected: int
    applications_need_info: int
    total_schemes: int
    active_schemes: int
