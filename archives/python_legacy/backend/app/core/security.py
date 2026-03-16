from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.crud.policy import get_system_policy
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def validate_password_strength(password: str):
    policy = await get_system_policy()
    p = policy.password_policy
    
    if len(password) < p.min_length:
        return False, f"Password must be at least {p.min_length} characters long"
    if p.require_uppercase and not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if p.require_lowercase and not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if p.require_numbers and not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    if p.require_special_chars and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
        
    return True, "Password is valid"
