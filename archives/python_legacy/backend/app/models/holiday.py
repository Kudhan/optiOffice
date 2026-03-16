from pydantic import BaseModel
from typing import Optional

class HolidayBase(BaseModel):
    name: str
    date: str
    type: str
    description: Optional[str] = None

class HolidayCreate(HolidayBase):
    pass

class Holiday(HolidayBase):
    id: Optional[str] = None
