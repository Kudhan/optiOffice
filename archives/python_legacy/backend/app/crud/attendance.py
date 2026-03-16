from app.db.mongodb import database
from bson import ObjectId
from datetime import datetime

attendance_collection = database.get_collection("attendance_collection")

def attendance_helper(attendance) -> dict:
    return {
        "id": str(attendance["_id"]),
        "username": attendance["username"],
        "date": attendance["date"],
        "check_in": attendance.get("check_in"),
        "check_out": attendance.get("check_out"),
        "status": attendance.get("status", "Present"),
    }

async def get_attendance_by_user(username: str):
    records = []
    async for record in attendance_collection.find({"username": username}):
        records.append(attendance_helper(record))
    return records

async def create_attendance(attendance_data: dict):
    attendance = await attendance_collection.insert_one(attendance_data)
    new_attendance = await attendance_collection.find_one({"_id": attendance.inserted_id})
    return attendance_helper(new_attendance)

async def update_attendance(id: str, data: dict):
    if len(data) < 1:
        return False
    attendance = await attendance_collection.find_one({"_id": ObjectId(id)})
    if attendance:
        updated_attendance = await attendance_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return True
    return False
