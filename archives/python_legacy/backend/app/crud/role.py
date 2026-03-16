from app.db.mongodb import database
from bson import ObjectId

role_collection = database.get_collection("roles_collection")

def role_helper(role) -> dict:
    return {
        "id": str(role["_id"]),
        "name": role["name"],
        "description": role.get("description", ""),
        "permissions": role.get("permissions", []),
    }

async def get_roles():
    roles = []
    async for role in role_collection.find():
        roles.append(role_helper(role))
    return roles

async def get_role_by_name(name: str):
    role = await role_collection.find_one({"name": name})
    if role:
        return role_helper(role)
    return None

async def create_role(role_data: dict):
    role = await role_collection.insert_one(role_data)
    new_role = await role_collection.find_one({"_id": role.inserted_id})
    return role_helper(new_role)

async def update_role(id: str, data: dict):
    if len(data) < 1:
        return False
    role = await role_collection.find_one({"_id": ObjectId(id)})
    if role:
        updated_role = await role_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return True
    return False

async def delete_role(id: str):
    role = await role_collection.find_one({"_id": ObjectId(id)})
    if role:
        await role_collection.delete_one({"_id": ObjectId(id)})
        return True
    return False
