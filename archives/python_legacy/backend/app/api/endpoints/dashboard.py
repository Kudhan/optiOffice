from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.crud.user import get_user_by_username

router = APIRouter()

@router.get("/")
async def get_dashboard_data(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    # Dynamic content based on role
    if user["role"] == "admin":
        return {
            "message": f"Welcome Admin {user['full_name']}",
            "stats": {"users": 10, "revenue": 50000},
            "menu": ["Users", "Roles", "Policies", "Assets", "Attendance", "Leaves", "Tasks", "Settings", "Reports", "Billing", "Organization Tree", "Holidays"]
        }
    elif user["role"] == "manager":
        return {
            "message": f"Welcome Manager {user['full_name']}",
            "stats": {"project_progress": "75%", "active_sprints": 2},
            "menu": ["Projects", "My Team", "Assets", "Attendance", "Leaves", "Tasks", "Sprints", "Reports", "Organization Tree", "Holidays"]
        }
    else:
        return {
            "message": f"Welcome {user['full_name']}",
            "tasks": ["Task 1", "Task 2"],
            "menu": ["My Tasks", "Attendance", "Leaves", "Profile", "Organization Tree", "Holidays"]
        }
