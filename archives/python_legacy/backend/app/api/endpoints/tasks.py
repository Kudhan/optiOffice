from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.task import get_tasks, get_tasks_by_user, create_task, update_task, delete_task
from app.crud.user import get_user_by_username
from app.models.task import Task, TaskCreate, TaskUpdate
from app.crud.policy import get_system_policy

router = APIRouter()

@router.get("/", response_model=List[Task])
async def read_tasks(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] in ["admin", "manager"]:
        return await get_tasks()
    return await get_tasks_by_user(current_user)

@router.post("/", response_model=Task)
async def create_new_task(task: TaskCreate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    policy = await get_system_policy()
    task_policy = policy.task_policy

    # Check who can assign tasks
    if task_policy.who_can_assign_tasks == "manager" and user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only managers can assign tasks")
    
    # Check daily task limit (simplified check)
    current_tasks = await get_tasks_by_user(current_user)
    if len(current_tasks) >= task_policy.daily_task_limit:
        raise HTTPException(status_code=400, detail="Daily task limit reached")

    return await create_task(task.dict())

@router.put("/{id}", response_model=bool)
async def update_task_data(id: str, task: TaskUpdate, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    policy = await get_system_policy()
    task_policy = policy.task_policy
    
    update_data = {k: v for k, v in task.dict().items() if v is not None}
    
    if user["role"] == "employee":
        # Employees can only update status unless policy allows more
        if "status" in update_data and len(update_data) == 1:
             pass
        else:
             raise HTTPException(status_code=403, detail="Not authorized to update task details")
    
    # Check deadline override policy
    if "due_date" in update_data and not task_policy.allow_deadline_override and user["role"] == "employee":
        raise HTTPException(status_code=403, detail="Deadline override not allowed")

    updated = await update_task(id, update_data)
    if updated:
        return True
    raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/{id}", response_model=bool)
async def remove_task(id: str, current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    deleted = await delete_task(id)
    if deleted:
        return True
    raise HTTPException(status_code=404, detail="Task not found")
