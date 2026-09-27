"""
ATM Cash-Out Prediction System
CSV Upload & Model Training Trigger Routes
"""

import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from ml.preprocess import Preprocessor
from ml.train import run_training_pipeline

router = APIRouter(prefix="", tags=["Upload & Training"])

DATA_DIR = os.environ.get("DATA_DIR", "data")

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV transaction log files are supported")

    os.makedirs(DATA_DIR, exist_ok=True)
    save_path = os.path.join(DATA_DIR, f"uploaded_{file.filename}")
    
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    preprocessor = Preprocessor()
    try:
        stats = preprocessor.validate_csv(save_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV validation failed: {str(e)}")

    return {
        "message": "File uploaded and validated successfully",
        "filename": file.filename,
        "filepath": save_path,
        "validation_stats": stats
    }

@router.post("/train")
def trigger_training():
    data_file = os.path.join(DATA_DIR, "atm_transactions.csv")
    if not os.path.exists(data_file):
        raise HTTPException(status_code=400, detail="No transaction dataset found. Please generate or upload a dataset first.")

    try:
        metrics = run_training_pipeline(csv_path=data_file)
        return {
            "status": "success",
            "message": "Models successfully trained and evaluated with chronological split",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")
