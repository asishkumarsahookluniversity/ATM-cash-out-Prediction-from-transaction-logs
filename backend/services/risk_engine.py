"""
ATM Cash-Out Prediction System
Risk Engine Module

Configurable risk thresholds:
LOW:      p < 0.30
MEDIUM:   0.30 <= p < 0.60
HIGH:     0.60 <= p < 0.80
CRITICAL: p >= 0.80

Computes dynamic refill priority score taking into account:
- cashout_probability
- current cash balance vs capacity
- hours to empty
- withdrawal velocity
- location multiplier
"""

import os

# Configurable thresholds
LOW_THRESHOLD = float(os.environ.get("LOW_RISK_THRESHOLD", 0.30))
HIGH_THRESHOLD = float(os.environ.get("HIGH_RISK_THRESHOLD", 0.60))
CRITICAL_THRESHOLD = float(os.environ.get("CRITICAL_RISK_THRESHOLD", 0.80))

def classify_risk(probability: float) -> str:
    if probability >= CRITICAL_THRESHOLD:
        return "CRITICAL"
    elif probability >= HIGH_THRESHOLD:
        return "HIGH"
    elif probability >= LOW_THRESHOLD:
        return "MEDIUM"
    return "LOW"

def get_recommended_action(risk_level: str, hours_to_empty: float) -> str:
    if risk_level == "CRITICAL" or hours_to_empty < 6.0:
        return "URGENT REFILL"
    elif risk_level == "HIGH" or hours_to_empty < 14.0:
        return "REFILL REQUIRED"
    elif risk_level == "MEDIUM" or hours_to_empty < 28.0:
        return "REFILL SOON"
    return "MONITOR"

def calculate_priority_score(
    probability: float,
    current_balance: float,
    max_capacity: float,
    hours_to_empty: float,
    withdrawal_velocity: float,
    is_high_traffic_location: bool = False
) -> float:
    """
    Computes continuous priority score between 0.0 and 100.0.
    Higher score means higher refill urgency.
    """
    # 1. Probability component (weight 45%)
    prob_score = min(1.0, probability) * 45.0
    
    # 2. Hours to empty urgency component (weight 30%)
    # If hours to empty is < 6h -> max 30 pts, scaling down as hours increase up to 48h
    if hours_to_empty <= 6.0:
        time_score = 30.0
    elif hours_to_empty <= 24.0:
        time_score = 30.0 * (1.0 - (hours_to_empty - 6.0) / 18.0 * 0.6)
    elif hours_to_empty <= 48.0:
        time_score = 12.0 * (1.0 - (hours_to_empty - 24.0) / 24.0)
    else:
        time_score = 2.0
        
    # 3. Balance depletion ratio component (weight 15%)
    depletion_ratio = 1.0 - max(0.0, min(1.0, current_balance / max(1.0, max_capacity)))
    balance_score = depletion_ratio * 15.0
    
    # 4. Velocity and location boost (weight 10%)
    velocity_norm = min(1.0, withdrawal_velocity / 3000.0) * 5.0
    loc_boost = 5.0 if is_high_traffic_location else 0.0
    
    total_score = prob_score + time_score + balance_score + velocity_norm + loc_boost
    return round(min(100.0, max(0.0, total_score)), 2)
