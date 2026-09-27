"""
ATM Cash-Out Prediction System
FastAPI Application Entry Point
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.routes.prediction import router as prediction_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.transactions import router as transactions_router
from backend.routes.upload import router as upload_router
from backend.database import init_db

app = FastAPI(
    title="ATM Cash-Out Prediction & Monitoring System API",
    description="Real-time transaction log analysis, cash-out risk estimation, and replenishment optimization API",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/")
def root():
    return {
        "system": "ATM Cash-Out Prediction System",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "model_loaded": True
    }

# Include routers
app.include_router(prediction_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(upload_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
