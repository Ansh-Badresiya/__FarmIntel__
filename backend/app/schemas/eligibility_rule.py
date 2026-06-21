from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any, Dict

class EligibilityRuleBase(BaseModel):
    rule_name: str
    rule_logic: Dict[str, Any]
    priority: int = 0

class EligibilityRuleCreate(EligibilityRuleBase):
    scheme_id: UUID

class EligibilityRuleOut(EligibilityRuleBase):
    id: UUID
    scheme_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
