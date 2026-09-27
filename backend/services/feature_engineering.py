"""
ATM Cash-Out Prediction System
Feature Engineering Service
Extracts real-time prediction features from single ATM input or state.
"""

import math
from typing import Dict, Any, List

FEATURE_ORDER = [
    "hour",
    "day_of_week",
    "is_weekend",
    "current_balance",
    "withdrawal_1h",
    "withdrawal_3h",
    "withdrawal_6h",
    "withdrawal_12h",
    "withdrawal_24h",
    "rolling_mean_withdrawal",
    "rolling_std_withdrawal",
    "transaction_velocity",
    "demand_growth_rate",
    "time_since_last_refill",
    "estimated_daily_demand",
    "estimated_hours_to_empty",
    "atm_avg_daily_demand",
    "atm_peak_hour_demand",
    "refill_amount"
]

def extract_features_from_input(payload: Dict[str, Any]) -> List[float]:
    current_cash = float(payload.get("current_cash", 25000.0))
    w1 = float(payload.get("recent_1h_demand", 2500.0))
    w6 = float(payload.get("recent_6h_demand", 12000.0))
    w24 = float(payload.get("recent_24h_demand", 32000.0))
    w3 = (w1 + (w6 - w1) * 0.4) # interpolated 3h demand
    w12 = (w6 + (w24 - w6) * 0.45) # interpolated 12h demand

    hour = int(payload.get("hour", 14))
    day_of_week = int(payload.get("day_of_week", 4))
    is_weekend = 1.0 if day_of_week in [5, 6] else 0.0

    withdrawal_rate = float(payload.get("withdrawal_rate", 15.0))
    velocity = max(w1, w6 / 6.0)
    growth_rate = ((w1 * 24.0) / max(1.0, w24)) - 1.0

    hours_since_refill = float(payload.get("hours_since_refill", 24.0))
    last_refill_amount = float(payload.get("last_refill_amount", 100000.0))

    est_daily_demand = max(5000.0, w24)
    burn_rate_hourly = max(100.0, est_daily_demand / 24.0)
    hours_to_empty = max(0.0, current_cash / burn_rate_hourly)

    atm_avg = max(15000.0, est_daily_demand * 0.95)
    atm_peak = atm_avg * 0.16

    mean_w = 120.0 # average individual withdrawal ticket size
    std_w = 65.0

    feature_vector = [
        float(hour),
        float(day_of_week),
        is_weekend,
        current_cash,
        w1,
        w3,
        w6,
        w12,
        w24,
        mean_w,
        std_w,
        velocity,
        growth_rate,
        hours_since_refill,
        est_daily_demand,
        hours_to_empty,
        atm_avg,
        atm_peak,
        last_refill_amount
    ]
    return feature_vector
