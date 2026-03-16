from pydantic import BaseModel
from typing import Optional

class LeaveBase(BaseModel):
    username: str
    type: str  # Annual, Sick, etc.
    start_date: str
    end_date: str
    reason: Optional[str] = None
    status: str = "Pending"  # Pending, Approved, Rejected

class LeaveCreate(LeaveBase):
    pass

class LeaveUpdate(BaseModel):
    status: Optional[str] = None
    rejection_reason: Optional[str] = None

class Leave(LeaveBase):
    id: str
