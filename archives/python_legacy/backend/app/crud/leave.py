from app.db.mongodb import database
from bson import ObjectId

leave_collection = database.get_collection("leaves_collection")

def leave_helper(leave) -> dict:
    return {
        "id": str(leave["_id"]),
        "username": leave["username"],
        "type": leave["type"],
        "start_date": leave["start_date"],
        "end_date": leave["end_date"],
        "reason": leave.get("reason"),
        "status": leave.get("status", "Pending"),
    }

async def get_leaves():
    leaves = []
    async for leave in leave_collection.find():
        leaves.append(leave_helper(leave))
    return leaves

async def get_leaves_by_user(username: str):
    leaves = []
    async for leave in leave_collection.find({"username": username}):
        leaves.append(leave_helper(leave))
    return leaves

async def create_leave(leave_data: dict):
    leave = await leave_collection.insert_one(leave_data)
    new_leave = await leave_collection.find_one({"_id": leave.inserted_id})
    return leave_helper(new_leave)

async def update_leave(id: str, data: dict):
    if len(data) < 1:
        return False
    leave = await leave_collection.find_one({"_id": ObjectId(id)})
    if leave:
        updated_leave = await leave_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return True
    return False
