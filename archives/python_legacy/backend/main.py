from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.core.config import settings
from app.api.api import api_router
from app.crud.user import get_user_by_username, create_user
from app.crud.holiday import get_holidays, create_holiday
from app.core.security import get_password_hash

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    existing_admin = await get_user_by_username("admin")
    if not existing_admin:
        admin_user = {
            "username": "admin",
            "full_name": "Admin User",
            "email": "admin@example.com",
            "hashed_password": get_password_hash("admin"),
            "disabled": False,
            "role": "admin",
            "designation": "System Administrator",
            "department": "IT",
            "status": "Active"
        }
        await create_user(admin_user)
        
    existing_manager = await get_user_by_username("manager")
    if not existing_manager:
        manager_user = {
            "username": "manager",
            "full_name": "Project Manager",
            "email": "manager@example.com",
            "hashed_password": get_password_hash("manager123"),
            "disabled": False,
            "role": "manager",
            "designation": "Senior Manager",
            "department": "Engineering",
            "status": "Active"
        }
        await create_user(manager_user)

    existing_user = await get_user_by_username("user")
    if not existing_user:
        regular_user = {
            "username": "user",
            "full_name": "Regular User",
            "email": "user@example.com",
            "hashed_password": get_password_hash("user"),
            "disabled": False,
            "role": "employee",
            "designation": "Software Engineer",
            "department": "Engineering",
            "manager_id": "manager",
            "status": "Active"
        }
        await create_user(regular_user)
    
    # Initialize holidays
    holidays = await get_holidays()
    if not holidays:
        default_holidays = [
            {"name": "New Year's Day", "date": "2024-01-01", "type": "Public", "description": "New Year Celebration"},
            {"name": "Independence Day", "date": "2024-07-04", "type": "Public", "description": "National Holiday"},
            {"name": "Christmas Day", "date": "2024-12-25", "type": "Public", "description": "Christmas Celebration"},
            {"name": "Labor Day", "date": "2024-09-02", "type": "Public", "description": "National Holiday"}
        ]
        for h in default_holidays:
            await create_holiday(h)
    
    yield
    # Shutdown logic (if any)

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://10.222.153.109:3000",
    "http://10.222.153.109:8000",
    "*" # Allow all for development to fix IP issues
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Office SaaS API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
