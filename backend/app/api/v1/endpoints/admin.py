"""
Admin Module – API Endpoints
============================
Provides routes for administrators to manage the system.

  POST   /admin/scheme            – create a new subsidy scheme
  PUT    /admin/scheme/{id}       – update scheme
  DELETE /admin/scheme/{id}       – soft delete scheme
  POST   /admin/rule              – add an eligibility rule
  PUT    /admin/rule/{id}         – update rule
  DELETE /admin/rule/{id}         – delete rule
  GET    /admin/users             – list all users
  PUT    /admin/users/{id}/role   – change user role
  GET    /admin/dashboard         – aggregate statistics
"""
from uuid import UUID
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query, status

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.api.dependencies import get_current_user, require_role

from app.services.admin_service import SubsidyService, UserManagementService
from app.schemas.subsidy_scheme import SubsidySchemeCreate, SubsidySchemeOut
from app.schemas.eligibility_rule import EligibilityRuleCreate, EligibilityRuleOut
from app.schemas.admin import SubsidySchemeUpdate, EligibilityRuleUpdate, UserRoleUpdate, DashboardStats
from app.schemas.user import UserOut
from app.models.subsidy_scheme import SubsidyScheme
from app.models.eligibility_rule import EligibilityRule

router = APIRouter(
    dependencies=[
        Depends(get_current_user),
        Depends(require_role(UserRole.admin))
    ]
)

def get_subsidy_service(db: Session = Depends(get_db)) -> SubsidyService:
    return SubsidyService(db)

def get_user_mgmt_service(db: Session = Depends(get_db)) -> UserManagementService:
    return UserManagementService(db)


# ── Schemes ──────────────────────────────────────────────────────────────────

@router.get("/schemes", response_model=List[SubsidySchemeOut])
def list_schemes(
    db: Session = Depends(get_db),
) -> Any:
    """List all subsidy schemes (active and inactive)."""
    return db.query(SubsidyScheme).order_by(SubsidyScheme.created_at.desc()).all()


@router.post("/scheme", response_model=SubsidySchemeOut, status_code=status.HTTP_201_CREATED)
def create_scheme(
    scheme_in: SubsidySchemeCreate,
    current_user: User = Depends(get_current_user),
    service: SubsidyService = Depends(get_subsidy_service)
) -> Any:
    """Create a new subsidy scheme."""
    return service.create_scheme(current_user.id, scheme_in)

@router.put("/scheme/{scheme_id}", response_model=SubsidySchemeOut)
def update_scheme(
    scheme_id: UUID,
    scheme_in: SubsidySchemeUpdate,
    service: SubsidyService = Depends(get_subsidy_service)
) -> Any:
    """Update a subsidy scheme."""
    return service.update_scheme(scheme_id, scheme_in)

@router.delete("/scheme/{scheme_id}", response_model=SubsidySchemeOut)
def delete_scheme(
    scheme_id: UUID,
    service: SubsidyService = Depends(get_subsidy_service)
) -> Any:
    """Soft delete a subsidy scheme (sets is_active=False)."""
    return service.delete_scheme(scheme_id)


# ── Rules ────────────────────────────────────────────────────────────────────

@router.get("/rules", response_model=List[EligibilityRuleOut])
def list_rules(
    scheme_id: Optional[UUID] = Query(None, description="Filter rules by scheme"),
    db: Session = Depends(get_db),
) -> Any:
    """List all eligibility rules, optionally filtered by scheme."""
    q = db.query(EligibilityRule)
    if scheme_id:
        q = q.filter(EligibilityRule.scheme_id == scheme_id)
    return q.order_by(EligibilityRule.scheme_id, EligibilityRule.priority).all()


@router.post("/rule", response_model=EligibilityRuleOut, status_code=status.HTTP_201_CREATED)
def create_rule(
    rule_in: EligibilityRuleCreate,
    service: SubsidyService = Depends(get_subsidy_service)
) -> Any:
    """Add an eligibility rule to a scheme."""
    return service.add_rule(rule_in)

@router.put("/rule/{rule_id}", response_model=EligibilityRuleOut)
def update_rule(
    rule_id: UUID,
    rule_in: EligibilityRuleUpdate,
    service: SubsidyService = Depends(get_subsidy_service)
) -> Any:
    """Update an eligibility rule."""
    return service.update_rule(rule_id, rule_in)

@router.delete("/rule/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(
    rule_id: UUID,
    service: SubsidyService = Depends(get_subsidy_service)
) -> None:
    """Delete an eligibility rule."""
    service.delete_rule(rule_id)


# ── Users ────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[UserRole] = Query(None, description="Filter users by role"),
    service: UserManagementService = Depends(get_user_mgmt_service)
) -> Any:
    """List users, optionally filtering by role."""
    return service.list_users(role=role)

@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: UUID,
    role_in: UserRoleUpdate,
    service: UserManagementService = Depends(get_user_mgmt_service)
) -> Any:
    """Change a user's role."""
    return service.update_user_role(user_id, role_in)


# ── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    service: UserManagementService = Depends(get_user_mgmt_service)
) -> Any:
    """Get aggregated statistics for the admin dashboard."""
    return service.get_dashboard_stats()
