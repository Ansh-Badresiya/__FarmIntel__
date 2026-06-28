from typing import List, Optional
from uuid import UUID
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
    applications_pending: int
    applications_approved: int
    applications_rejected: int
    total_schemes: int
