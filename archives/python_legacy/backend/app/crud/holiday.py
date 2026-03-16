from app.db.mongodb import database

holiday_collection = database.get_collection("holidays_collection")

def holiday_helper(holiday) -> dict:
    return {
        "id": str(holiday["_id"]),
        "name": holiday["name"],
        "date": holiday["date"],
        "type": holiday["type"],
        "description": holiday.get("description", "")
    }

async def get_holidays():
    holidays = []
    async for holiday in holiday_collection.find():
        holidays.append(holiday_helper(holiday))
    return holidays

async def create_holiday(holiday_data: dict):
    holiday = await holiday_collection.insert_one(holiday_data)
    new_holiday = await holiday_collection.find_one({"_id": holiday.inserted_id})
    return holiday_helper(new_holiday)
