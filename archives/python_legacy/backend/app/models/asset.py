from pydantic import BaseModel
from typing import Optional

class AssetBase(BaseModel):
    name: str
    type: str
    serial_number: Optional[str] = None
    assigned_to: Optional[str] = None  # Username
    status: str = "Available"  # Available, Assigned, Maintenance, Retired

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    serial_number: Optional[str] = None
    assigned_to: Optional[str] = None
    status: Optional[str] = None

class Asset(AssetBase):
    id: str
