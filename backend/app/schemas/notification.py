from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class NotificationOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    notification_type: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationCount(BaseModel):
    total: int
    unread: int
