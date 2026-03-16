from app.db.mongodb import database
from app.models.user import UserInDB
from app.core.security import get_password_hash

user_collection = database.get_collection("users_collection")

def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "phone": user.get("phone", ""),
        "profile_photo": user.get("profile_photo", ""),
        "disabled": user.get("disabled", False),
        "role": user["role"],
        "hashed_password": user["hashed_password"],
        "designation": user.get("designation", ""),
        "department": user.get("department", ""),
        "manager_id": user.get("manager_id", None),
        "status": user.get("status", "Active"),
        "joining_date": user.get("joining_date", ""),
        "preferences": user.get("preferences", {
            "language": "en",
            "timezone": "UTC",
            "notifications": "email"
        })
    }

async def get_user_by_username(username: str):
    user = await user_collection.find_one({"username": username})
    if user:
        return user_helper(user)
    return None

async def create_user(user_data: dict):
    user = await user_collection.insert_one(user_data)
    new_user = await user_collection.find_one({"_id": user.inserted_id})
    return user_helper(new_user)

async def get_users():
    users = []
    async for user in user_collection.find():
        users.append(user_helper(user))
    return users

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
    return await update_user(username, {"status": "Resigned", "disabled": True})

async def get_users_by_manager(manager_username: str):
    users = []
    async for user in user_collection.find({"manager_id": manager_username}):
        users.append(user_helper(user))
    return users
