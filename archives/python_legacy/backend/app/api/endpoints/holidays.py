from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.holiday import get_holidays, create_holiday
from app.crud.user import get_user_by_username
from app.models.holiday import Holiday, HolidayCreate

router = APIRouter()

@router.get("/", response_model=List[Holiday])
async def read_holidays(current_user: str = Depends(get_current_user)):
    return await get_holidays()

@router.post("/", response_model=Holiday)
async def create_new_holiday(holiday: HolidayCreate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can add holidays")
    
    new_holiday = await create_holiday(holiday.dict())
    return new_holiday
