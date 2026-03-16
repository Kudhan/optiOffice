from app.db.mongodb import database
from bson import ObjectId

task_collection = database.get_collection("tasks_collection")

def task_helper(task) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task["title"],
        "description": task.get("description"),
        "assigned_to": task.get("assigned_to"),
        "status": task.get("status", "To Do"),
        "priority": task.get("priority", "Medium"),
        "due_date": task.get("due_date"),
    }

async def get_tasks():
    tasks = []
    async for task in task_collection.find():
        tasks.append(task_helper(task))
    return tasks

async def get_tasks_by_user(username: str):
    tasks = []
    async for task in task_collection.find({"assigned_to": username}):
        tasks.append(task_helper(task))
    return tasks

async def create_task(task_data: dict):
    task = await task_collection.insert_one(task_data)
    new_task = await task_collection.find_one({"_id": task.inserted_id})
    return task_helper(new_task)

async def update_task(id: str, data: dict):
    if len(data) < 1:
        return False
    task = await task_collection.find_one({"_id": ObjectId(id)})
    if task:
        updated_task = await task_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return True
    return False

async def delete_task(id: str):
    task = await task_collection.find_one({"_id": ObjectId(id)})
    if task:
        await task_collection.delete_one({"_id": ObjectId(id)})
        return True
    return False
