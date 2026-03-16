from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.user import (
    get_user_by_username, 
    create_user, 
    get_users, 
    update_user, 
    delete_user, 
    get_users_by_manager
)
from app.models.user import User, UserCreate, UserUpdate
from app.core.security import get_password_hash, validate_password_strength
from app.crud.policy import get_system_policy

router = APIRouter()

@router.get("/me", response_model=User)
async def read_users_me(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    return user

@router.put("/me", response_model=User)
async def update_my_profile(user_update: UserUpdate, current_user: str = Depends(get_current_user)):
    # Filter out None values and restricted fields for self-update
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if "role" in update_data:
        del update_data["role"]
    if "status" in update_data:
        del update_data["status"]
        
    updated = await update_user(current_user, update_data)
    if updated:
        return await get_user_by_username(current_user)
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/", response_model=User)
async def create_new_user(user: UserCreate, current_user: str = Depends(get_current_user)):
    admin = await get_user_by_username(current_user)
    if admin["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to create users")

    # Check max users policy
    policy = await get_system_policy()
    current_users = await get_users()
    if len(current_users) >= policy.user_policy.max_users:
        raise HTTPException(status_code=400, detail="Max user limit reached")

    # Validate password strength
    is_valid, msg = await validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    existing_user = await get_user_by_username(user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    user_data = user.dict()
    user_data["hashed_password"] = get_password_hash(user.password)
    del user_data["password"]
    
    new_user = await create_user(user_data)
    return new_user

@router.get("/", response_model=List[User])
async def get_all_users(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] == "admin":
        return await get_users()
    elif user["role"] == "manager":
        return await get_users_by_manager(user["username"])
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view users")

@router.put("/{username}", response_model=User)
async def update_user_data(username: str, user_update: UserUpdate, current_user: str = Depends(get_current_user)):
    admin = await get_user_by_username(current_user)
    if admin["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to update users")
        
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    updated = await update_user(username, update_data)
    if updated:
        return await get_user_by_username(username)
    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/{username}")
async def resign_user(username: str, current_user: str = Depends(get_current_user)):
    admin = await get_user_by_username(current_user)
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can process resignations")

    # Check soft delete policy (though currently delete_user implements soft delete)
    policy = await get_system_policy()
    if not policy.user_policy.allow_soft_delete:
        # If soft delete not allowed, maybe implement hard delete or throw error
        # For now, we stick to the soft delete implementation in crud
        pass

    updated = await delete_user(username)
    if updated:
        return {"message": "User marked as resigned successfully"}
    raise HTTPException(status_code=404, detail="User not found")
