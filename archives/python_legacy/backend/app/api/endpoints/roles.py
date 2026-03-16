from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.role import get_roles, create_role, update_role, delete_role, get_role_by_name
from app.crud.user import get_user_by_username
from app.models.role import Role, RoleCreate, RoleUpdate

router = APIRouter()

@router.get("/", response_model=List[Role])
async def read_roles(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return await get_roles()

@router.post("/", response_model=Role)
async def create_new_role(role: RoleCreate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing_role = await get_role_by_name(role.name)
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")

    return await create_role(role.dict())

@router.put("/{id}", response_model=bool)
async def update_role_data(id: str, role: RoleUpdate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in role.dict().items() if v is not None}
    updated = await update_role(id, update_data)
    if updated:
        return True
    raise HTTPException(status_code=404, detail="Role not found")

@router.delete("/{id}", response_model=bool)
async def remove_role(id: str, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    deleted = await delete_role(id)
    if deleted:
        return True
    raise HTTPException(status_code=404, detail="Role not found")
