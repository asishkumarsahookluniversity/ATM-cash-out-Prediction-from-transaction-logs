"""
ATM Cash-Out Prediction System
Data Models for System Entities
"""

from dataclasses import dataclass
from typing import Optional

@dataclass
class ATMRecord:
    atm_id: str
    location: str
    current_balance: float
    max_capacity: float
    daily_avg_demand: float
    status: str
    last_refill_date: Optional[str] = None

@dataclass
class TransactionRecord:
    atm_id: str
    timestamp: str
    transaction_type: str
    amount: float
    balance_after: float
    location: Optional[str] = None

@dataclass
class PredictionResult:
    atm_id: str
    cashout_probability: float
    risk_level: str
    predicted_cashout: bool
    estimated_hours_to_empty: float
    recommended_action: str
    priority_score: float
    priority_rank: int
    recommended_refill_amount: float
