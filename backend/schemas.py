"""
ATM Cash-Out Prediction System
Pydantic Schemas for Request & Response Serialization
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    atm_id: str = Field(default="ATM001", description="Identifier of the ATM")
    current_cash: float = Field(default=22000.0, description="Current balance inside ATM cash vault")
    recent_1h_demand: float = Field(default=3500.0, description="Withdrawal sum in last 1 hour")
    recent_6h_demand: float = Field(default=14200.0, description="Withdrawal sum in last 6 hours")
    recent_24h_demand: float = Field(default=38500.0, description="Withdrawal sum in last 24 hours")
    withdrawal_rate: float = Field(default=18.5, description="Withdrawals per hour")
    last_refill_amount: float = Field(default=100000.0, description="Amount loaded in previous replenishment")
    hours_since_refill: float = Field(default=36.0, description="Elapsed hours since last cash refill")
    day_of_week: int = Field(default=5, description="0=Monday, 6=Sunday")
    hour: int = Field(default=14, description="Hour of the day 0-23")
    location: Optional[str] = Field(default="Downtown Metro Station", description="ATM Location")

class PredictResponse(BaseModel):
    atm_id: str
    cashout_probability: float
    risk_level: str
    predicted_cashout: bool
    estimated_hours_to_empty: float
    recommended_action: str
    priority_score: float
    priority_rank: Optional[int] = None
    recommended_refill_amount: float

class BatchPredictRequest(BaseModel):
    atm_ids: Optional[List[str]] = None

class ATMItem(BaseModel):
    atm_id: str
    location: str
    current_balance: float
    max_capacity: float
    daily_avg_demand: float
    status: str
    last_refill_date: Optional[str] = None
    probability: float
    risk_level: str
    estimated_hours_to_empty: float
    recommended_action: str
    priority_rank: int
    recommended_refill_amount: float

class DashboardKPIs(BaseModel):
    total_atms: int
    atms_at_risk: int
    critical_atms: int
    average_cash_balance: float
    todays_withdrawals: float
    predicted_cashouts: int

class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int
    critical: int

class RefillRecommendation(BaseModel):
    atm_id: str
    location: str
    current_balance: float
    predicted_24h_demand: float
    recommended_refill: float
    priority_rank: int
    priority_score: float
    urgency: str
    hours_to_empty: float

class AlertItem(BaseModel):
    id: int
    atm_id: str
    timestamp: str
    severity: str
    message: str
    is_resolved: bool
