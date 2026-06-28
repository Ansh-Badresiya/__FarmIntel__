"""
Officer Module – API Endpoints
==============================
Provides routes that allow field officers (and admins) to:

  GET  /officer/applications              – list pending applications
  GET  /officer/application/{id}          – full detail of one application
  POST /officer/approve/{id}              – approve a pending application
  POST /officer/reject/{id}               – reject a pending application
  POST /officer/request-document/{id}     – ask farmer for more documents
  POST /officer/assign/{id}               – (admin only) assign officer to application

All mutating endpoints enforce:
  • Caller must be officer or admin  (via require_any_role)
  • Application must still be in 'pending' state  (enforced by ApplicationService)
"""

from uuid import UUID
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User, UserRole
from app.api.dependencies import get_current_user, require_any_role, require_role
from app.services.application_service import ApplicationService

from app.schemas.officer import (
    ApplicationListOut,
    ApplicationDetailOut,
    ApproveApplicationRequest,
    RejectApplicationRequest,
    RequestDocumentRequest,
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
    summary="List pending applications",
    description=(
        "Returns all applications whose status is **pending**. "
        "An officer sees only applications assigned to them; "
        "an admin sees every pending application."
    ),
)
def list_pending_applications(
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

    return service.list_pending(officer_id=officer_filter)


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
    return service.get_application_detail(application_id)


# ── State transitions ────────────────────────────────────────────────────────

@router.post(
    "/approve/{application_id}",
    response_model=ApplicationDetailOut,
    summary="Approve an application",
    description=(
        "Approve a **pending** application. "
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
        "Reject a **pending** application with a mandatory `reason`. "
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
    "/request-document/{application_id}",
    response_model=ApplicationDetailOut,
    summary="Request additional documents",
    description=(
        "Ask the farmer to supply additional documents. "
        "The application **remains pending**; the request is appended to the notes history."
    ),
)
def request_additional_document(
    application_id: UUID,
    body: RequestDocumentRequest,
    service: ApplicationService = Depends(get_application_service),
) -> Any:
    return service.request_document(application_id, document_request=body.document_request)


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
