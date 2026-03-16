import motor.motor_asyncio
from app.core.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)
database = client.office_saas

def get_database():
    return database
