from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.asset import get_assets, create_asset, update_asset, delete_asset
from app.crud.user import get_user_by_username
from app.models.asset import Asset, AssetCreate, AssetUpdate

router = APIRouter()

@router.get("/", response_model=List[Asset])
async def read_assets(current_user: str = Depends(get_current_user)):
    return await get_assets()

@router.post("/", response_model=Asset)
async def create_new_asset(asset: AssetCreate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await create_asset(asset.dict())

@router.put("/{id}", response_model=bool)
async def update_asset_data(id: str, asset: AssetUpdate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {k: v for k, v in asset.dict().items() if v is not None}
    updated = await update_asset(id, update_data)
    if updated:
        return True
    raise HTTPException(status_code=404, detail="Asset not found")

@router.delete("/{id}", response_model=bool)
async def remove_asset(id: str, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    deleted = await delete_asset(id)
    if deleted:
        return True
    raise HTTPException(status_code=404, detail="Asset not found")
