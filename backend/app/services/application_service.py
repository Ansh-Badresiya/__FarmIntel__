"""
ApplicationService — business-logic layer for subsidy-application state transitions.

Rules enforced here:
  • Only *pending*, *need_info*, or *under_verification* applications can be approved / rejected.
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
from app.services.notification_service import NotificationService


class ApplicationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ApplicationRepository(db)
        self.notification_service = NotificationService(db)

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

    def _get_updatable_or_raise(self, application_id: UUID) -> SubsidyApplication:
        """Internal helper: load application and verify it is not finalized."""
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        if application.status in [ApplicationStatus.approved, ApplicationStatus.rejected]:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Application is already '{application.status.value}'. "
                    "Cannot be updated."
                ),
            )
        return application

    def _send_status_notification(self, application: SubsidyApplication):
        """Sends a notification to the farmer based on the new application status."""
        scheme_name = application.scheme.scheme_name if application.scheme else "Scheme"
        user_id = application.farmer.user_id if application.farmer else None
        if not user_id:
            return

        status = application.status
        title = ""
        message = ""
        notification_type = f"application_{status.value}"

        if status == ApplicationStatus.approved:
            title = f"Application Approved: {scheme_name}"
            message = f"Your application for {scheme_name} has been approved."
        elif status == ApplicationStatus.rejected:
            title = f"Application Rejected: {scheme_name}"
            message = f"Your application for {scheme_name} has been rejected. Reason: {application.notes}"
        elif status == ApplicationStatus.need_info:
            title = f"Action Required: {scheme_name}"
            message = f"Additional information is needed for your {scheme_name} application. Note: {application.notes}"
        elif status == ApplicationStatus.under_verification:
            title = f"Under Verification: {scheme_name}"
            message = f"Your application for {scheme_name} is currently under verification."

        if title and message:
            self.notification_service.create_notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type
            )

    def approve(
        self, application_id: UUID, notes: Optional[str] = None
    ) -> SubsidyApplication:
        """Approve a non-finalized application."""
        application = self._get_updatable_or_raise(application_id)
        app = self.repo.update_status(
            application, ApplicationStatus.approved, notes=notes
        )
        self._send_status_notification(app)
        return app

    def reject(self, application_id: UUID, reason: str) -> SubsidyApplication:
        """Reject a non-finalized application with a mandatory reason."""
        if not reason or not reason.strip():
            raise HTTPException(
                status_code=422, detail="A rejection reason must be provided."
            )
        application = self._get_updatable_or_raise(application_id)
        app = self.repo.update_status(
            application, ApplicationStatus.rejected, notes=reason
        )
        self._send_status_notification(app)
        return app

    def request_document(
        self, application_id: UUID, document_request: str
    ) -> SubsidyApplication:
        """
        Request additional documents from the farmer.
        Changes status to need_info.
        """
        if not document_request or not document_request.strip():
            raise HTTPException(
                status_code=422, detail="A document description must be provided."
            )
        application = self._get_updatable_or_raise(application_id)
        formatted_note = f"[Document Request] {document_request}"
        app = self.repo.update_status(
            application, ApplicationStatus.need_info, notes=formatted_note
        )
        self._send_status_notification(app)
        return app

    # ── Assignment ────────────────────────────────────────────────────────────

    def assign_officer(
        self, application_id: UUID, officer_id: UUID
    ) -> SubsidyApplication:
        """Assign an officer to any application (admin operation)."""
        application = self.repo.get_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        return self.repo.assign_officer(application, officer_id)
