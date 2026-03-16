from pydantic import BaseModel
from typing import Optional, Dict

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_photo: Optional[str] = None
    disabled: Optional[bool] = None
    role: str = "user"
    designation: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None
    status: Optional[str] = "Active"
    joining_date: Optional[str] = None
    preferences: Optional[Dict[str, str]] = {
        "language": "en",
        "timezone": "UTC",
        "notifications": "email"
    }

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_photo: Optional[str] = None
    role: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None
    status: Optional[str] = None
    preferences: Optional[Dict[str, str]] = None

class UserInDB(UserBase):
    hashed_password: str

class User(UserBase):
    id: Optional[str] = None
