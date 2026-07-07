from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Any
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.api.dependencies import get_current_user
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationOut, NotificationCount

router = APIRouter(
    dependencies=[Depends(get_current_user)]
)

def get_notification_service(db: Session = Depends(get_db)):
    return NotificationService(db)

@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
) -> Any:
    """Get all notifications for the current user."""
    return service.get_user_notifications(current_user.id)

@router.get("/unread-count", response_model=NotificationCount)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
) -> Any:
    """Get count of unread notifications."""
    total = len(service.get_user_notifications(current_user.id))
    unread = service.get_unread_count(current_user.id)
    return {"total": total, "unread": unread}

@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
) -> Any:
    """Mark a specific notification as read."""
    return service.mark_as_read(notification_id, current_user.id)

@router.post("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    service: NotificationService = Depends(get_notification_service)
) -> Any:
    """Mark all notifications as read."""
    count = service.mark_all_as_read(current_user.id)
    return {"updated_count": count}
