from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.models.notification import Notification

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self, user_id: UUID, title: str, message: str, notification_type: Optional[str] = None
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_user_notifications(self, user_id: UUID, limit: int = 50) -> List[Notification]:
        return self.db.query(Notification)\
            .filter(Notification.user_id == user_id)\
            .order_by(Notification.created_at.desc())\
            .limit(limit)\
            .all()

    def get_unread_count(self, user_id: UUID) -> int:
        return self.db.query(Notification)\
            .filter(Notification.user_id == user_id, Notification.is_read == False)\
            .count()

    def mark_as_read(self, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        notification = self.db.query(Notification)\
            .filter(Notification.id == notification_id, Notification.user_id == user_id)\
            .first()
        if notification:
            notification.is_read = True
            self.db.commit()
            self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: UUID) -> int:
        updated_count = self.db.query(Notification)\
            .filter(Notification.user_id == user_id, Notification.is_read == False)\
            .update({"is_read": True})
        self.db.commit()
        return updated_count
