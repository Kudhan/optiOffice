from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.crud.user import get_users

router = APIRouter()

@router.get("/tree")
async def get_org_tree(current_user: str = Depends(get_current_user)):
    # Simple hierarchy builder
    all_users = await get_users()
    
    # Build map
    user_map = {u["username"]: {**u, "children": []} for u in all_users}
    root = []
    
    for username, user in user_map.items():
        manager_id = user.get("manager_id")
        if manager_id and manager_id in user_map:
            user_map[manager_id]["children"].append(user)
        else:
            root.append(user)
            
    return root
