from pydantic import BaseModel
from typing import Optional, List

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: str = "To Do"  # To Do, In Progress, Done
    priority: str = "Medium"  # Low, Medium, High
    due_date: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class Task(TaskBase):
    id: str
