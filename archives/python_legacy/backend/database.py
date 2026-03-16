import motor.motor_asyncio
from bson import ObjectId

MONGO_DETAILS = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.office_saas

user_collection = database.get_collection("users_collection")
holiday_collection = database.get_collection("holidays_collection")

# Helpers

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "disabled": user.get("disabled", False),
        "role": user["role"],
        "hashed_password": user["hashed_password"],
        "designation": user.get("designation", ""),
        "department": user.get("department", ""),
        "manager_id": user.get("manager_id", None),
        "status": user.get("status", "Active"),
        "joining_date": user.get("joining_date", ""),
    }

def holiday_helper(holiday) -> dict:
    return {
        "id": str(holiday["_id"]),
        "name": holiday["name"],
        "date": holiday["date"],
        "type": holiday["type"],
        "description": holiday.get("description", "")
    }

# CRUD Operations

async def retrieve_users():
    users = []
    async for user in user_collection.find():
        users.append(user_helper(user))
    return users

async def add_user(user_data: dict) -> dict:
    user = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": user.inserted_id})
    return user_helper(new_user)

async def retrieve_user(username: str) -> dict:
    user = await user_collection.find_one({"username": username})
    if user:
        return user_helper(user)
    return None

async def update_user(username: str, data: dict):
    if len(data) < 1:
        return False
    user = await user_collection.find_one({"username": username})
    if user:
        updated_user = await user_collection.update_one(
            {"username": username}, {"$set": data}
        )
        return True
    return False

async def delete_user(username: str):
    # Soft delete - mark as resigned
    return await update_user(username, {"status": "Resigned", "disabled": True})

async def retrieve_users_by_manager(manager_username: str):
    users = []
    async for user in user_collection.find({"manager_id": manager_username}):
        users.append(user_helper(user))
    return users

async def retrieve_holidays():
    holidays = []
    async for holiday in holiday_collection.find():
        holidays.append(holiday_helper(holiday))
    return holidays

async def add_holiday(holiday_data: dict) -> dict:
    holiday = await holiday_collection.insert_one(holiday_data)
    new_holiday = await holiday_collection.find_one({"_id": holiday.inserted_id})
    return holiday_helper(new_holiday)
