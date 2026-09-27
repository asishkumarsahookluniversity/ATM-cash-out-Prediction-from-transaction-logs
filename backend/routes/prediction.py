"""
ATM Cash-Out Prediction System
Prediction API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from backend.schemas import PredictRequest, PredictResponse, BatchPredictRequest
from backend.services.prediction_service import get_prediction_service

router = APIRouter(prefix="", tags=["Predictions"])

@router.post("/predict", response_model=PredictResponse)
def predict_single(req: PredictRequest):
    service = get_prediction_service()
    payload = req.dict()
    result = service.predict_one(payload)
    return PredictResponse(**result)

@router.post("/predict/batch")
def predict_batch(req: BatchPredictRequest):
    service = get_prediction_service()
    # Batch predict for ATM IDs or all
    atm_ids = req.atm_ids or [f"ATM{i:03d}" for i in range(1, 51)]
    results = []
    
    for atm_id in atm_ids:
        # Default typical state for simulation
        mock_payload = {
            "atm_id": atm_id,
            "current_cash": 24000.0,
            "recent_1h_demand": 2100.0,
            "recent_6h_demand": 11000.0,
            "recent_24h_demand": 31000.0,
            "withdrawal_rate": 14.0,
            "hours_since_refill": 28.0,
            "location": "Downtown Metro"
        }
        res = service.predict_one(mock_payload)
        results.append(res)
        
    # Sort descending by priority score
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    for idx, item in enumerate(results, start=1):
        item["priority_rank"] = idx
        
    return results
