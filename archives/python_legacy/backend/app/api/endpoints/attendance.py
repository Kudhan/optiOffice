from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.attendance import get_attendance_by_user, create_attendance, update_attendance
from app.models.attendance import Attendance, AttendanceCreate, AttendanceUpdate
from app.crud.policy import get_system_policy
from datetime import datetime, time

router = APIRouter()

@router.get("/me", response_model=List[Attendance])
async def read_my_attendance(current_user: str = Depends(get_current_user)):
    return await get_attendance_by_user(current_user)

@router.post("/check-in", response_model=Attendance)
async def check_in(current_user: str = Depends(get_current_user)):
    policy = await get_system_policy()
    att_policy = policy.attendance_policy
    
    now = datetime.now()
    
    # Check grace period
    start_time = datetime.strptime(att_policy.office_start_time, "%H:%M").time()
    grace_limit = (datetime.combine(datetime.today(), start_time) + timedelta(minutes=att_policy.grace_period_minutes)).time()
    
    status = "Present"
    if now.time() > grace_limit:
        status = "Late"
        
    attendance_data = {
        "username": current_user,
        "date": now.strftime("%Y-%m-%d"),
        "check_in": now,
        "status": status
    }
    return await create_attendance(attendance_data)

@router.put("/check-out/{id}", response_model=bool)
async def check_out(id: str, current_user: str = Depends(get_current_user)):
    update_data = {"check_out": datetime.now()}
    updated = await update_attendance(id, update_data)
    if updated:
        return True
    raise HTTPException(status_code=404, detail="Attendance record not found")
