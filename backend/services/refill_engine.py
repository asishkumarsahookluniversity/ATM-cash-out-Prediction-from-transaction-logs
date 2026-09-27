"""
ATM Cash-Out Prediction System
Refill Recommendation Engine

Formula:
recommended_refill = (predicted_daily_demand * safety_days) + safety_stock - current_balance
Constrained by ATM maximum canister capacity and standard cassette bill denominations.
"""

import os

DEFAULT_SAFETY_DAYS = float(os.environ.get("SAFETY_DAYS", 2.5))
DEFAULT_SAFETY_STOCK_RATIO = float(os.environ.get("SAFETY_STOCK_RATIO", 0.20))
MIN_REFILL_UNIT = 5000.0 # rounded to nearest $5,000 for standard cash cassettes

def calculate_recommended_refill(
    predicted_daily_demand: float,
    current_balance: float,
    max_capacity: float = 120000.0,
    safety_days: float = DEFAULT_SAFETY_DAYS,
    safety_stock_ratio: float = DEFAULT_SAFETY_STOCK_RATIO
) -> float:
    # 1. Base required replenishment for expected demand during replenishment cycle
    demand_component = predicted_daily_demand * safety_days
    
    # 2. Dynamic safety stock buffer based on volatility and demand
    safety_stock = predicted_daily_demand * safety_stock_ratio
    
    # 3. Gross requirement
    gross_needed = demand_component + safety_stock - current_balance
    
    if gross_needed <= 0:
        return 0.0
        
    # 4. Respect machine physical cassette capacity
    available_vault_space = max(0.0, max_capacity - current_balance)
    fill_amount = min(gross_needed, available_vault_space)
    
    # 5. Round to standard bank cassette bundle multiples (e.g. $5,000 increments)
    rounded_amount = round(fill_amount / MIN_REFILL_UNIT) * MIN_REFILL_UNIT
    
    # Always ensure at least minimum replenishment if refill triggered
    if rounded_amount < MIN_REFILL_UNIT and fill_amount > 1000.0:
        rounded_amount = MIN_REFILL_UNIT
        
    return min(available_vault_space, rounded_amount)
