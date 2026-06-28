"""
ApplicationService — business-logic layer for subsidy-application state transitions.

Rules enforced here:
  • Only *pending* applications can be approved / rejected / have documents requested.
  • Only users with role == officer (or admin) may approve/reject — enforced at the
    endpoint layer via require_role; the service itself is role-agnostic so it can
    be reused by admin endpoints if needed.
"""
from uuid import UUID
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.application_repo import ApplicationRepository
from app.models.subsidy_application import SubsidyApplication, ApplicationStatus


class ApplicationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ApplicationRepository(db)

    # ── Queries ───────────────────────────────────────────────────────────────

    def list_pending(
        self, officer_id: Optional[UUID] = None
    ) -> List[SubsidyApplication]:
        """
        Return pending applications.
        When officer_id is given, only applications assigned to that officer
        are returned, enabling each officer to see their own queue.
        """
        return self.repo.list_pending(assigned_officer_id=officer_id)

    def get_application_detail(self, application_id: UUID) -> SubsidyApplication:
        """Return a fully-loaded application or raise 404."""
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        return application

    # ── State transitions ─────────────────────────────────────────────────────

    def _get_pending_or_raise(self, application_id: UUID) -> SubsidyApplication:
        """Internal helper: load application and verify it is still pending."""
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        if application.status != ApplicationStatus.pending:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Application is already '{application.status.value}'. "
                    "Only pending applications can be updated."
                ),
            )
        return application

    def approve(
        self, application_id: UUID, notes: Optional[str] = None
    ) -> SubsidyApplication:
        """Approve a pending application."""
        application = self._get_pending_or_raise(application_id)
        return self.repo.update_status(
            application, ApplicationStatus.approved, notes=notes
        )

    def reject(self, application_id: UUID, reason: str) -> SubsidyApplication:
        """Reject a pending application with a mandatory reason."""
        if not reason or not reason.strip():
            raise HTTPException(
                status_code=422, detail="A rejection reason must be provided."
            )
        application = self._get_pending_or_raise(application_id)
        return self.repo.update_status(
            application, ApplicationStatus.rejected, notes=reason
        )

    def request_document(
        self, application_id: UUID, document_request: str
    ) -> SubsidyApplication:
        """
        Request additional documents from the farmer.

        The application stays *pending* (status is not changed).
        A timestamped note is appended to the existing notes so the request
        history is preserved.
        """
        if not document_request or not document_request.strip():
            raise HTTPException(
                status_code=422, detail="A document description must be provided."
            )
        application = self._get_pending_or_raise(application_id)
        formatted_note = f"[Document Request] {document_request}"
        return self.repo.append_notes(application, formatted_note)

    # ── Assignment ────────────────────────────────────────────────────────────

    def assign_officer(
        self, application_id: UUID, officer_id: UUID
    ) -> SubsidyApplication:
        """Assign an officer to any application (admin operation)."""
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        return self.repo.assign_officer(application, officer_id)
