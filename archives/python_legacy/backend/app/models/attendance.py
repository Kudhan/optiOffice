from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttendanceBase(BaseModel):
    username: str
    date: str  # YYYY-MM-DD
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str = "Present"  # Present, Absent, Leave, Late

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    check_out: Optional[datetime] = None
    status: Optional[str] = None

class Attendance(AttendanceBase):
    id: str
