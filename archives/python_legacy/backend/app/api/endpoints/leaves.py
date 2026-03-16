from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.leave import get_leaves, get_leaves_by_user, create_leave, update_leave
from app.crud.user import get_user_by_username
from app.models.leave import Leave, LeaveCreate, LeaveUpdate
from app.crud.policy import get_system_policy

router = APIRouter()

@router.get("/", response_model=List[Leave])
async def read_leaves(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] in ["admin", "manager"]:
        return await get_leaves()
    return await get_leaves_by_user(current_user)

@router.post("/", response_model=Leave)
async def apply_leave(leave: LeaveCreate, current_user: str = Depends(get_current_user)):
    policy = await get_system_policy()
    leave_policy = policy.leave_policy
    
    # Check leave balance (simplified logic)
    # In a real app, you'd calculate actual balance from DB
    current_leaves = await get_leaves_by_user(current_user)
    used_leaves = len([l for l in current_leaves if l["status"] == "Approved" and l["type"] == leave.type])
    
    quota = 0
    if leave.type == "Annual": quota = leave_policy.annual_leave_quota
    elif leave.type == "Sick": quota = leave_policy.sick_leave_quota
    elif leave.type == "Casual": quota = leave_policy.casual_leave_quota
    
    if used_leaves >= quota and not leave_policy.allow_negative_balance:
        raise HTTPException(status_code=400, detail="Insufficient leave balance")

    leave_data = leave.dict()
    leave_data["username"] = current_user
    return await create_leave(leave_data)

@router.put("/{id}/approve", response_model=bool)
async def approve_leave(id: str, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated = await update_leave(id, {"status": "Approved"})
    if updated:
        return True
    raise HTTPException(status_code=404, detail="Leave request not found")

@router.put("/{id}/reject", response_model=bool)
async def reject_leave(id: str, reason: str, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    updated = await update_leave(id, {"status": "Rejected", "rejection_reason": reason})
    if updated:
        return True
    raise HTTPException(status_code=404, detail="Leave request not found")
