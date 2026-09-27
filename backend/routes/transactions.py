"""
ATM Cash-Out Prediction System
ATMs, Transactions, and Refill Recommendations API Routes
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List

router = APIRouter(prefix="", tags=["ATMs & Transactions"])

# Standard static / mock helper for initial API schema
@router.get("/atms")
def list_atms():
    return {"message": "List of ATMs with live prediction states"}

@router.get("/atms/{atm_id}")
def get_atm_details(atm_id: str):
    return {"atm_id": atm_id, "message": "ATM detail telemetry"}

@router.get("/transactions")
def list_transactions(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    atm_id: Optional[str] = None
):
    return {"page": page, "limit": limit, "transactions": []}

@router.get("/refill-recommendations")
def get_refill_recommendations():
    return {"recommendations": []}
