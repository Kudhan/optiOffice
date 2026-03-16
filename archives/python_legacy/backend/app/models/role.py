from pydantic import BaseModel
from typing import List, Optional

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = []

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None

class Role(RoleBase):
    id: str
