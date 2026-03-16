from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.policy import get_system_policy, update_system_policy
from app.crud.user import get_user_by_username
from app.models.policy import SystemPolicy, SystemPolicyUpdate

router = APIRouter()

@router.get("/", response_model=SystemPolicy)
async def read_policies(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return await get_system_policy()

@router.put("/", response_model=SystemPolicy)
async def update_policies(policy: SystemPolicyUpdate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Convert Pydantic model to dict, excluding None values
    policy_data = policy.dict(exclude_unset=True)
    return await update_system_policy(policy_data)
