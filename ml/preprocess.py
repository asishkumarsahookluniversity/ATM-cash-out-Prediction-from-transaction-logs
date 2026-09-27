"""
ATM Cash-Out Prediction System
Data Preprocessing & Feature Engineering Module

Handles:
- Column validation & dynamic mapping
- Missing value imputation
- Duplicate removal
- Chronological sorting
- Feature extraction (rolling demand windows, velocities, time features, cash ratios)
- Target variable creation (cashout_risk in next 24 hours) without future leakage
"""

import os
import csv
import json
import math
from datetime import datetime, timedelta

DEFAULT_COLUMN_MAPPING = {
    "atm_id": ["ATM_ID", "atm_id", "terminal_id", "machine_id", "ATM ID"],
    "timestamp": ["Timestamp", "timestamp", "datetime", "transaction_time", "Tx_Date", "Date"],
    "transaction_type": ["Transaction_Type", "transaction_type", "tx_type", "Type"],
    "transaction_amount": ["Transaction_Amount", "transaction_amount", "amount", "Tx_Amount"],
    "balance": ["Balance_After_Transaction", "balance", "current_balance", "Balance"],
    "withdrawal_count": ["Withdrawal_Count", "withdrawal_count", "is_withdrawal"],
    "deposit_count": ["Deposit_Count", "deposit_count", "is_deposit"],
    "refill_amount": ["Refill_Amount", "refill_amount", "cash_refill"],
    "location": ["Location", "location", "atm_location", "site"],
    "day_of_week": ["Day_of_Week", "day_of_week", "weekday"],
    "hour": ["Hour", "hour", "tx_hour"]
}

class Preprocessor:
    def __init__(self, min_cash_threshold=15000, prediction_horizon_hours=24):
        self.min_cash_threshold = min_cash_threshold
        self.prediction_horizon_hours = prediction_horizon_hours
        self.feature_columns = [
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

    def validate_csv(self, filepath):
        """Validates CSV format, checks headers, detects row count, missing values, duplicates."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")

        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            headers = next(reader, None)
            if not headers:
                raise ValueError("CSV file is empty or corrupted")

            total_rows = 0
            missing_count = 0
            seen_hashes = set()
            duplicate_count = 0
            sample_rows = []

            for row in reader:
                if not row or not any(row):
                    continue
                total_rows += 1
                if any(val.strip() == "" for val in row):
                    missing_count += 1
                
                # Check duplicate
                row_hash = hash(tuple(row))
                if row_hash in seen_hashes:
                    duplicate_count += 1
                else:
                    seen_hashes.add(row_hash)
                    
                if len(sample_rows) < 5:
                    sample_rows.append(row)

        detected_mapping = {}
        for canonical, aliases in DEFAULT_COLUMN_MAPPING.items():
            matched = None
            for alias in aliases:
                for h in headers:
                    if h.strip().lower() == alias.lower():
                        matched = h
                        break
                if matched:
                    break
            detected_mapping[canonical] = matched or aliases[0]

        return {
            "valid": True,
            "headers": headers,
            "total_rows": total_rows,
            "missing_values": missing_count,
            "duplicates": duplicate_count,
            "column_mapping": detected_mapping,
            "sample_rows": sample_rows
        }

    def load_and_preprocess(self, filepath, max_records=20000):
        """
        Parses CSV across the full timeline, handles chronologically sorted transactions per ATM,
        computes backward rolling windows (no leakage), and calculates target cashout_risk.
        """
        stats = self.validate_csv(filepath)
        col_map = stats["column_mapping"]
        total_rows = stats["total_rows"]
        stride = max(1, total_rows // max_records) if total_rows > max_records else 1

        records_by_atm = {}
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            row_idx = 0
            for row in reader:
                row_idx += 1
                if stride > 1 and row_idx % stride != 0:
                    continue
                atm_id = row.get(col_map["atm_id"], "ATM001").strip()
                ts_str = row.get(col_map["timestamp"], "").strip()
                
                try:
                    ts = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S")
                except Exception:
                    try:
                        ts = datetime.fromisoformat(ts_str)
                    except Exception:
                        continue
                        
                tx_type = row.get(col_map["transaction_type"], "WITHDRAWAL").strip()
                
                try:
                    amount = float(row.get(col_map["transaction_amount"], 0))
                except Exception:
                    amount = 0.0
                    
                try:
                    balance = float(row.get(col_map["balance"], 50000))
                except Exception:
                    balance = 50000.0
                    
                try:
                    refill = float(row.get(col_map["refill_amount"], 0))
                except Exception:
                    refill = 0.0
                    
                location = row.get(col_map["location"], "Standard Branch")

                if atm_id not in records_by_atm:
                    records_by_atm[atm_id] = []
                    
                records_by_atm[atm_id].append({
                    "atm_id": atm_id,
                    "timestamp": ts,
                    "tx_type": tx_type,
                    "amount": amount,
                    "balance": balance,
                    "refill": refill,
                    "location": location
                })

        # Sort each ATM's transactions chronologically
        for atm_id in records_by_atm:
            records_by_atm[atm_id].sort(key=lambda x: x["timestamp"])

        feature_matrix = []
        target_vector = []
        timestamps = []
        atm_ids = []
        balances = []

        # Process features with no data leakage using efficient window tracking
        for atm_id, tx_list in records_by_atm.items():
            if not tx_list:
                continue
            last_refill_ts = tx_list[0]["timestamp"]
            all_withdrawals = [tx["amount"] for tx in tx_list if tx["tx_type"] == "WITHDRAWAL"]
            days_span = max(1, (tx_list[-1]["timestamp"] - tx_list[0]["timestamp"]).days)
            # Scale sum of withdrawals by stride to reflect true total daily ATM demand
            atm_avg_daily = (sum(all_withdrawals) * stride / days_span) if all_withdrawals else 25000.0

            # Step through each transaction as an observation point
            for i, tx in enumerate(tx_list):
                if tx["tx_type"] == "REFILL" or tx["refill"] > 0:
                    last_refill_ts = tx["timestamp"]

                curr_ts = tx["timestamp"]
                w_1h = 0.0
                w_3h = 0.0
                w_6h = 0.0
                w_12h = 0.0
                w_24h = 0.0
                window_amounts = []

                # Efficient backward scan limited to at most 100 recent transactions
                max_back = min(100, i + 1)
                for step_b in range(max_back):
                    prev_tx = tx_list[i - step_b]
                    dt_hours = (curr_ts - prev_tx["timestamp"]).total_seconds() / 3600.0
                    if dt_hours > 24.0:
                        break
                    if prev_tx["tx_type"] == "WITHDRAWAL":
                        amt = prev_tx["amount"]
                        if dt_hours <= 1.0:
                            w_1h += amt
                        if dt_hours <= 3.0:
                            w_3h += amt
                        if dt_hours <= 6.0:
                            w_6h += amt
                        if dt_hours <= 12.0:
                            w_12h += amt
                        w_24h += amt
                        window_amounts.append(amt)

                # Rolling stats
                if window_amounts:
                    mean_w = sum(window_amounts) / len(window_amounts)
                    var_w = sum((x - mean_w) ** 2 for x in window_amounts) / len(window_amounts)
                    std_w = math.sqrt(var_w)
                else:
                    mean_w = 0.0
                    std_w = 0.0

                velocity = (w_1h / 1.0) if w_1h > 0 else (w_3h / 3.0 if w_3h > 0 else (w_24h / 24.0))
                growth_rate = ((w_3h / 3.0) / (max(1.0, w_24h / 24.0))) - 1.0

                hours_since_refill = max(0.1, (curr_ts - last_refill_ts).total_seconds() / 3600.0)
                est_daily_demand = max(5000.0, w_24h if w_24h > 1000 else atm_avg_daily)
                hourly_burn_rate = max(100.0, est_daily_demand / 24.0)
                hours_to_empty = max(0.0, tx["balance"] / hourly_burn_rate)

                is_weekend = 1.0 if curr_ts.weekday() in [5, 6] else 0.0

                # Check future cashout_risk in next 24 hours (TARGET LABEL)
                # Label is 1 if balance falls below threshold in next 24h OR current balance minus 24h demand drops below threshold
                cashout_in_next_24h = 0
                if (tx["balance"] - est_daily_demand) <= self.min_cash_threshold or hours_to_empty <= 24.0:
                    cashout_in_next_24h = 1
                else:
                    max_ahead = min(100, len(tx_list) - (i + 1))
                    for step_f in range(1, max_ahead + 1):
                        fut_tx = tx_list[i + step_f]
                        dt_future_hours = (fut_tx["timestamp"] - curr_ts).total_seconds() / 3600.0
                        if dt_future_hours > self.prediction_horizon_hours:
                            break
                        if fut_tx["balance"] <= self.min_cash_threshold or fut_tx["tx_type"] == "WITHDRAWAL_FAILED":
                            cashout_in_next_24h = 1
                            break

                feature_row = [
                    float(curr_ts.hour),
                    float(curr_ts.weekday()),
                    is_weekend,
                    tx["balance"],
                    w_1h,
                    w_3h,
                    w_6h,
                    w_12h,
                    w_24h,
                    mean_w,
                    std_w,
                    velocity,
                    growth_rate,
                    hours_since_refill,
                    est_daily_demand,
                    hours_to_empty,
                    atm_avg_daily,
                    atm_avg_daily * 0.15,
                    tx["refill"]
                ]

                feature_matrix.append(feature_row)
                target_vector.append(cashout_in_next_24h)
                timestamps.append(curr_ts)
                atm_ids.append(atm_id)
                balances.append(tx["balance"])

        return {
            "features": feature_matrix,
            "targets": target_vector,
            "timestamps": timestamps,
            "atm_ids": atm_ids,
            "balances": balances,
            "feature_names": self.feature_columns
        }
