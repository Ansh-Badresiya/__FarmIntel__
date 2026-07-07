"""
Officer Module – API Endpoints
==============================
Provides routes that allow field officers (and admins) to:

  GET  /officer/applications              – list pending applications (with filters)
  GET  /officer/application/{id}          – full detail of one application
  POST /officer/approve/{id}              – approve a pending application
  POST /officer/reject/{id}               – reject a pending application
  POST /officer/need-info/{id}            – ask farmer for more documents/info
  POST /officer/assign/{id}               – (admin only) assign officer to application

All mutating endpoints enforce:
  • Caller must be officer or admin  (via require_any_role)
  • Application must not be in a finalized state  (enforced by ApplicationService)
"""

from uuid import UUID
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import String

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.subsidy_application import ApplicationStatus
from app.api.dependencies import get_current_user, require_any_role, require_role
from app.services.application_service import ApplicationService

from app.schemas.officer import (
    ApplicationListOut,
    ApplicationDetailOut,
    ApproveApplicationRequest,
    RejectApplicationRequest,
    NeedInfoRequest,
    AssignOfficerRequest,
)

# ---------------------------------------------------------------------------
# Router – base-level auth guard: must be officer OR admin
# ---------------------------------------------------------------------------
router = APIRouter(
    dependencies=[
        Depends(get_current_user),
        Depends(require_any_role(UserRole.officer, UserRole.admin)),
    ]
)


def get_application_service(db: Session = Depends(get_db)) -> ApplicationService:
    return ApplicationService(db)


# ── Queries ─────────────────────────────────────────────────────────────────

@router.get(
    "/applications",
    response_model=List[ApplicationListOut],
    summary="List applications (officer queue)",
    description="Returns applications assigned to the officer, or all applications for an admin. Supports filtering by status.",
)
def list_applications(
    status: Optional[ApplicationStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by farmer name or ID"),
    district: Optional[str] = Query(None, description="Filter by district"),
    current_user: User = Depends(get_current_user),
    service: ApplicationService = Depends(get_application_service),
) -> Any:
    """
    Officers receive their own queue (filtered by assigned_officer).
    Admins receive the global unfiltered list.
    """
    officer_filter: Optional[UUID] = None
    if current_user.role == UserRole.officer:
        officer_filter = current_user.id

    from app.models.subsidy_application import SubsidyApplication
    from app.models.farmer import Farmer
    from app.models.subsidy_scheme import SubsidyScheme
    
    query = service.db.query(SubsidyApplication)\
        .join(Farmer, SubsidyApplication.farmer_id == Farmer.id)\
        .join(User, Farmer.user_id == User.id)\
        .join(SubsidyScheme, SubsidyApplication.scheme_id == SubsidyScheme.id)
    
    if officer_filter:
        query = query.filter(SubsidyApplication.assigned_officer == officer_filter)
        
    if status:
        query = query.filter(SubsidyApplication.status == status)
        
    if district:
        query = query.filter(Farmer.district.ilike(f"%{district}%"))
        
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | 
            (Farmer.father_name.ilike(f"%{search}%")) |
            (SubsidyApplication.id.cast(String).ilike(f"%{search}%"))
        )
        
    apps = query.order_by(SubsidyApplication.application_date.desc()).all()
    
    # Convert to dict format to include computed fields
    result = []
    for app in apps:
        app_dict = {
            "id": app.id,
            "status": app.status,
            "application_date": app.application_date,
            "decision_date": app.decision_date,
            "updated_at": app.updated_at,
            "assigned_officer": app.assigned_officer,
            "notes": app.notes,
            "farmer_id": app.farmer_id,
            "scheme_id": app.scheme_id,
            "farmer_name": app.farmer.user.full_name if (app.farmer and app.farmer.user) else "Unknown",
            "farmer_district": app.farmer.district if app.farmer else "Unknown",
            "scheme_name": app.scheme.scheme_name if app.scheme else "Unknown",
        }
        result.append(app_dict)
        
    return result


@router.get(
    "/application/{application_id}",
    response_model=ApplicationDetailOut,
    summary="Get application details",
    description="Returns full details of a single application including farmer profile, scheme info, and any uploaded documents.",
)
def get_application_detail(
    application_id: UUID,
    service: ApplicationService = Depends(get_application_service),
) -> Any:
    app = service.get_application_detail(application_id)
    
    # Get the farmer's first farm if exists
    farm = None
    if app.farmer and app.farmer.farms:
        farm = app.farmer.farms[0]
    
    # Construct response with proper nested objects
    return {
        "id": app.id,
        "status": app.status,
        "application_date": app.application_date,
        "decision_date": app.decision_date,
        "updated_at": app.updated_at,
        "assigned_officer": app.assigned_officer,
        "notes": app.notes,
        "documents": app.documents,
        "inspection_status": app.inspection_status,
        "farmer": app.farmer,
        "farm": farm,
        "scheme": app.scheme,
    }


# ── State transitions ────────────────────────────────────────────────────────

@router.post(
    "/approve/{application_id}",
    response_model=ApplicationDetailOut,
    summary="Approve an application",
    description=(
        "Approve an application. "
        "Sets status → `approved` and records `decision_date`. "
        "Optional `notes` field can hold approval remarks."
    ),
)
def approve_application(
    application_id: UUID,
    body: ApproveApplicationRequest,
    service: ApplicationService = Depends(get_application_service),
) -> Any:
    return service.approve(application_id, notes=body.notes)


@router.post(
    "/reject/{application_id}",
    response_model=ApplicationDetailOut,
    summary="Reject an application",
    description=(
        "Reject an application with a mandatory `reason`. "
        "Sets status → `rejected` and records `decision_date`."
    ),
)
def reject_application(
    application_id: UUID,
    body: RejectApplicationRequest,
    service: ApplicationService = Depends(get_application_service),
) -> Any:
    return service.reject(application_id, reason=body.reason)


@router.post(
    "/need-info/{application_id}",
    response_model=ApplicationDetailOut,
    summary="Request additional information",
    description=(
        "Ask the farmer to supply additional information or documents. "
        "Sets status → `need_info` and records the request in notes."
    ),
)
def request_additional_info(
    application_id: UUID,
    body: NeedInfoRequest,
    service: ApplicationService = Depends(get_application_service),
) -> Any:
    return service.request_document(application_id, document_request=body.message)


# ── Admin-only: officer assignment ──────────────────────────────────────────

@router.post(
    "/assign/{application_id}",
    response_model=ApplicationDetailOut,
    summary="Assign officer to application",
    description="Admin-only. Assigns a specific officer to an application so it appears in that officer's queue.",
    dependencies=[Depends(require_role(UserRole.admin))],
)
def assign_officer(
    application_id: UUID,
    body: AssignOfficerRequest,
    service: ApplicationService = Depends(get_application_service),
) -> Any:
    return service.assign_officer(application_id, officer_id=body.officer_id)
