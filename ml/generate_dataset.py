"""
ATM Cash-Out Prediction System
Dataset Generation Script

Generates realistic synthetic transaction logs for 50 ATMs across 60 days
with temporal demand patterns (morning/evening peaks, weekend surges,
location-specific characteristics, cash refill events, and realistic cash drawdowns).
"""

import os
import sys
import random
import math
from datetime import datetime, timedelta

def generate_atm_dataset(output_path="data/atm_transactions.csv", num_atms=50, days=60):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    print(f"Generating realistic ATM transaction logs for {num_atms} ATMs over {days} days...")
    
    locations = [
        ("Downtown Metro Station", 1.45, 120000),
        ("Airport Terminal 1", 1.60, 150000),
        ("Shopping Mall Plaza", 1.35, 100000),
        ("Suburban Branch", 0.85, 80000),
        ("University Campus", 1.10, 75000),
        ("Hospital Center", 0.95, 90000),
        ("Business District Plaza", 1.30, 110000),
        ("Residential Market", 0.90, 70000),
        ("Tech Park Gate 2", 1.25, 100000),
        ("Train Central Station", 1.50, 130000),
    ]
    
    atm_configs = {}
    for i in range(1, num_atms + 1):
        atm_id = f"ATM{i:03d}"
        loc_name, loc_multiplier, base_capacity = random.choice(locations)
        capacity = base_capacity + random.choice([-10000, 0, 10000, 20000])
        starting_bal = capacity * random.uniform(0.35, 0.85)
        atm_configs[atm_id] = {
            "location": loc_name,
            "demand_multiplier": loc_multiplier * random.uniform(0.9, 1.1),
            "max_capacity": capacity,
            "balance": starting_bal,
            "refill_cycle_days": random.choice([3, 4, 5]),
            "last_refill_time": None
        }

    start_date = datetime(2026, 7, 25, 0, 0, 0)
    records = []
    
    total_withdrawals = 0
    total_refills = 0
    total_deposits = 0
    
    # We step through time in 30-minute intervals across 45 days (plenty for 70k+ records)
    total_steps = days * 24 * 2
    current_time = start_date
    
    for atm_id, cfg in atm_configs.items():
        cfg["last_refill_time"] = start_date - timedelta(hours=random.randint(12, 60))
        
    csv_rows = ["ATM_ID,Timestamp,Transaction_Type,Transaction_Amount,Balance_After_Transaction,Withdrawal_Count,Deposit_Count,Refill_Amount,Location,Day_of_Week,Hour"]
    
    for step in range(total_steps):
        time_point = start_date + timedelta(minutes=step * 30)
        hour = time_point.hour
        day_of_week = time_point.weekday() # 0 = Monday, 6 = Sunday
        is_weekend = day_of_week in [5, 6]
        
        # Diurnal pattern
        if 1 <= hour <= 5:
            hourly_weight = 0.12
        elif 6 <= hour <= 8:
            hourly_weight = 0.60
        elif 9 <= hour <= 11:
            hourly_weight = 1.10
        elif 12 <= hour <= 14:
            hourly_weight = 1.60
        elif 15 <= hour <= 16:
            hourly_weight = 1.20
        elif 17 <= hour <= 20:
            hourly_weight = 1.80
        elif 21 <= hour <= 22:
            hourly_weight = 0.90
        else:
            hourly_weight = 0.40
            
        if is_weekend:
            hourly_weight *= 1.40
            
        for atm_id, cfg in atm_configs.items():
            hours_since_refill = (time_point - cfg["last_refill_time"]).total_seconds() / 3600.0
            is_truck_window = hour in [6, 7, 8, 20, 21]
            scheduled_due = hours_since_refill >= (cfg["refill_cycle_days"] * 24.0)
            emergency_due = cfg["balance"] <= 5000.0
            
            should_refill = False
            # 12% delay risk on replenishments
            is_delayed = (hash(atm_id) % 7 == 0)
            if emergency_due and random.random() < (0.35 if not is_delayed else 0.15):
                should_refill = True
            elif scheduled_due and is_truck_window and random.random() < (0.75 if not is_delayed else 0.40):
                should_refill = True
                
            if should_refill:
                refill_amt = cfg["max_capacity"] - cfg["balance"]
                cfg["balance"] += refill_amt
                cfg["last_refill_time"] = time_point
                total_refills += 1
                csv_rows.append(
                    f"{atm_id},{time_point.strftime('%Y-%m-%d %H:%M:%S')},REFILL,{int(refill_amt)},{int(cfg['balance'])},0,0,{int(refill_amt)},{cfg['location']},{day_of_week},{hour}"
                )
                continue
                
            # Multiple transactions per 30-min window (2 to 7 transactions per half-hour during active periods)
            num_txs = int(round(random.uniform(1.0, 4.5) * hourly_weight * cfg["demand_multiplier"]))
            for _ in range(num_txs):
                r_type = random.random()
                if r_type < 0.90:
                    tx_type = "WITHDRAWAL"
                    base_amounts = [40, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500]
                    weights = [0.08, 0.08, 0.10, 0.22, 0.12, 0.10, 0.15, 0.06, 0.04, 0.03, 0.02]
                    amount = random.choices(base_amounts, weights=weights)[0]
                    
                    if cfg["balance"] >= amount:
                        cfg["balance"] -= amount
                        total_withdrawals += 1
                        csv_rows.append(
                            f"{atm_id},{time_point.strftime('%Y-%m-%d %H:%M:%S')},WITHDRAWAL,{amount},{int(cfg['balance'])},1,0,0,{cfg['location']},{day_of_week},{hour}"
                        )
                    else:
                        partial = int(cfg["balance"])
                        cfg["balance"] = 0
                        total_withdrawals += 1
                        csv_rows.append(
                            f"{atm_id},{time_point.strftime('%Y-%m-%d %H:%M:%S')},WITHDRAWAL_FAILED,{partial},0,1,0,0,{cfg['location']},{day_of_week},{hour}"
                        )
                elif r_type < 0.97:
                    tx_type = "DEPOSIT"
                    amount = random.choice([50, 100, 150, 200, 300, 500])
                    total_deposits += 1
                    csv_rows.append(
                        f"{atm_id},{time_point.strftime('%Y-%m-%d %H:%M:%S')},DEPOSIT,{amount},{int(cfg['balance'])},0,1,0,{cfg['location']},{day_of_week},{hour}"
                    )
                else:
                    csv_rows.append(
                        f"{atm_id},{time_point.strftime('%Y-%m-%d %H:%M:%S')},INQUIRY,0,{int(cfg['balance'])},0,0,0,{cfg['location']},{day_of_week},{hour}"
                    )

    # Write file
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(csv_rows))
        
    print(f"Dataset successfully created at: {output_path}")
    print(f"Total transaction logs generated: {len(csv_rows) - 1}")
    print(f"Withdrawals: {total_withdrawals}, Deposits: {total_deposits}, Refills: {total_refills}")
    return output_path

if __name__ == "__main__":
    generate_atm_dataset()
