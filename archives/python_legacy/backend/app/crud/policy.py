from app.db.mongodb import database
from app.models.policy import SystemPolicy

policy_collection = database.get_collection("policies_collection")

async def get_system_policy():
    policy = await policy_collection.find_one({"type": "system"})
    if policy:
        # Filter out _id and type before creating model
        policy_data = {k: v for k, v in policy.items() if k not in ["_id", "type"]}
        return SystemPolicy(**policy_data)
    # Return default policy if not set
    return SystemPolicy()

async def update_system_policy(policy_data: dict):
    # Ensure we are updating the single system policy document
    await policy_collection.update_one(
        {"type": "system"},
        {"$set": {**policy_data, "type": "system"}},
        upsert=True
    )
    return await get_system_policy()
