"""
ApplicationRepository — data-access layer for subsidy applications.

Separated from farmer_repo.py so the officer module can import
without pulling in all farmer dependencies.
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy.orm import Session, joinedload

from app.models.subsidy_application import SubsidyApplication, ApplicationStatus


class ApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    # ── Queries ───────────────────────────────────────────────────────────────

    def get_by_id(self, application_id: UUID) -> Optional[SubsidyApplication]:
        """Fetch a single application with farmer and scheme eager-loaded."""
        return (
            self.db.query(SubsidyApplication)
            .options(
                joinedload(SubsidyApplication.farmer),
                joinedload(SubsidyApplication.scheme),
            )
            .filter(SubsidyApplication.id == application_id)
            .first()
        )

    def list_pending(
        self,
        assigned_officer_id: Optional[UUID] = None,
    ) -> List[SubsidyApplication]:
        """
        Return pending applications.
        If assigned_officer_id is supplied, filter to that officer's queue.
        Otherwise return ALL pending applications (admin / unfiltered view).
        """
        query = self.db.query(SubsidyApplication).filter(
            SubsidyApplication.status == ApplicationStatus.pending
        )
        if assigned_officer_id is not None:
            query = query.filter(
                SubsidyApplication.assigned_officer == assigned_officer_id
            )
        return query.order_by(SubsidyApplication.application_date.asc()).all()

    def list_all(self) -> List[SubsidyApplication]:
        """Return every application regardless of status (admin use)."""
        return (
            self.db.query(SubsidyApplication)
            .order_by(SubsidyApplication.application_date.desc())
            .all()
        )

    # ── Mutations ─────────────────────────────────────────────────────────────

    def update_status(
        self,
        application: SubsidyApplication,
        new_status: ApplicationStatus,
        notes: Optional[str] = None,
    ) -> SubsidyApplication:
        """Set status + decision_date and optionally overwrite notes."""
        application.status = new_status
        application.decision_date = datetime.now(tz=timezone.utc)
        if notes is not None:
            application.notes = notes
        self.db.commit()
        self.db.refresh(application)
        return application

    def append_notes(
        self,
        application: SubsidyApplication,
        additional_note: str,
    ) -> SubsidyApplication:
        """
        Append a note to the existing notes field (non-destructive).
        Used for document-request messages so previous notes are preserved.
        """
        existing = application.notes or ""
        separator = "\n---\n" if existing else ""
        application.notes = f"{existing}{separator}{additional_note}"
        self.db.commit()
        self.db.refresh(application)
        return application

    def assign_officer(
        self,
        application: SubsidyApplication,
        officer_id: UUID,
    ) -> SubsidyApplication:
        """Assign a specific officer to an application."""
        application.assigned_officer = officer_id
        self.db.commit()
        self.db.refresh(application)
        return application
