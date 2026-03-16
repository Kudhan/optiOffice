from app.db.mongodb import database
from bson import ObjectId

asset_collection = database.get_collection("assets_collection")

def asset_helper(asset) -> dict:
    return {
        "id": str(asset["_id"]),
        "name": asset["name"],
        "type": asset["type"],
        "serial_number": asset.get("serial_number"),
        "assigned_to": asset.get("assigned_to"),
        "status": asset.get("status", "Available"),
    }

async def get_assets():
    assets = []
    async for asset in asset_collection.find():
        assets.append(asset_helper(asset))
    return assets

async def create_asset(asset_data: dict):
    asset = await asset_collection.insert_one(asset_data)
    new_asset = await asset_collection.find_one({"_id": asset.inserted_id})
    return asset_helper(new_asset)

async def update_asset(id: str, data: dict):
    if len(data) < 1:
        return False
    asset = await asset_collection.find_one({"_id": ObjectId(id)})
    if asset:
        updated_asset = await asset_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": data}
        )
        return True
    return False

async def delete_asset(id: str):
    asset = await asset_collection.find_one({"_id": ObjectId(id)})
    if asset:
        await asset_collection.delete_one({"_id": ObjectId(id)})
        return True
    return False
