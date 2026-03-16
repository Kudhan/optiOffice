from fastapi import APIRouter
from app.api.endpoints import auth, users, holidays, dashboard, organization, billing, assets, attendance, leaves, tasks, roles, policies

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(holidays.router, prefix="/holidays", tags=["holidays"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(organization.router, prefix="/organization", tags=["organization"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(leaves.router, prefix="/leaves", tags=["leaves"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
