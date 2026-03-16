from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import get_current_user
from app.crud.user import get_user_by_username

router = APIRouter()

@router.get("/")
async def get_billing_info(current_user: str = Depends(get_current_user)):
    user = await get_user_by_username(current_user)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return {
        "plan": "Enterprise",
        "next_billing_date": "2023-12-01",
        "amount_due": 499.00,
        "invoices": [
            {"id": "INV-001", "date": "2023-10-01", "amount": 499.00, "status": "Paid"},
            {"id": "INV-002", "date": "2023-09-01", "amount": 499.00, "status": "Paid"}
        ]
    }
