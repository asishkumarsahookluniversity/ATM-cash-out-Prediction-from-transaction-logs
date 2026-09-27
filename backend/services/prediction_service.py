"""
ATM Cash-Out Prediction System
Prediction Service Module
Loads trained model and scaler artifacts, scales incoming features,
generates prediction probability, risk classification, and refill recommendations.
"""

import os
import json
import math
from typing import Dict, Any, List

from backend.services.feature_engineering import extract_features_from_input, FEATURE_ORDER
from backend.services.risk_engine import classify_risk, get_recommended_action, calculate_priority_score
from backend.services.refill_engine import calculate_recommended_refill

MODELS_DIR = os.environ.get("MODELS_DIR", "models")

class PredictionService:
    def __init__(self):
        self.scaler_data = None
        self.model_data = None
        self.feature_columns = FEATURE_ORDER
        self.load_artifacts()

    def load_artifacts(self):
        scaler_path = os.path.join(MODELS_DIR, "scaler.json")
        model_path = os.path.join(MODELS_DIR, "model_weights.json")

        if os.path.exists(scaler_path):
            try:
                with open(scaler_path, "r") as f:
                    self.scaler_data = json.load(f)
            except Exception as e:
                print(f"Error loading scaler: {e}")

        if os.path.exists(model_path):
            try:
                with open(model_path, "r") as f:
                    self.model_data = json.load(f)
            except Exception as e:
                print(f"Error loading model weights: {e}")

    def scale_features(self, features: List[float]) -> List[float]:
        if not self.scaler_data:
            return features
        means = self.scaler_data.get("means", [])
        stds = self.scaler_data.get("stds", [])
        scaled = []
        for i, val in enumerate(features):
            m = means[i] if i < len(means) else 0.0
            s = stds[i] if i < len(stds) and stds[i] > 1e-9 else 1.0
            scaled.append((val - m) / s)
        return scaled

    def predict_one(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        features = extract_features_from_input(payload)
        atm_id = payload.get("atm_id", "ATM001")
        current_cash = float(payload.get("current_cash", 25000.0))
        recent_24h_demand = float(payload.get("recent_24h_demand", 32000.0))
        recent_1h_demand = float(payload.get("recent_1h_demand", 2500.0))
        max_capacity = float(payload.get("max_capacity", 120000.0))

        # Hourly burn rate & hours to empty
        hourly_burn = max(50.0, recent_24h_demand / 24.0)
        hours_to_empty = round(max(0.0, current_cash / hourly_burn), 1)

        # Calculate probability via trained logistic weights or decision ensemble logic
        if self.model_data and "logistic_regression" in self.model_data:
            scaled = self.scale_features(features)
            lr_info = self.model_data["logistic_regression"]
            weights = lr_info.get("weights", [])
            bias = lr_info.get("bias", -0.5)

            z = bias
            for i, w in enumerate(weights):
                if i < len(scaled):
                    z += w * scaled[i]

            # Sigmoid probability
            prob = 1.0 / (1.0 + math.exp(-max(-35.0, min(35.0, z))))
            
            # Physics boundary calibration for robust operational reliability
            if hours_to_empty >= 48.0 and current_cash >= 40000.0:
                prob = min(prob, 0.20)
            elif hours_to_empty >= 72.0:
                prob = min(prob, 0.12)
            elif hours_to_empty <= 8.0 or current_cash <= 10000.0:
                prob = max(prob, 0.82)
            elif hours_to_empty <= 18.0:
                prob = max(prob, 0.65)
        else:
            # High-fidelity fallback heuristic based on hours to empty and critical balance
            if hours_to_empty <= 8.0 or current_cash <= 12000:
                prob = 0.88 + min(0.10, (12000 - current_cash) / 20000.0)
            elif hours_to_empty <= 18.0:
                prob = 0.65 + (18.0 - hours_to_empty) * 0.02
            elif hours_to_empty <= 30.0:
                prob = 0.35 + (30.0 - hours_to_empty) * 0.02
            else:
                prob = max(0.04, 0.25 - (hours_to_empty - 30.0) * 0.005)

        prob = round(max(0.01, min(0.99, prob)), 3)
        risk_level = classify_risk(prob)
        predicted_cashout = bool(prob >= 0.45 or hours_to_empty <= 24.0 and current_cash <= 15000)
        action = get_recommended_action(risk_level, hours_to_empty)

        priority_score = calculate_priority_score(
            probability=prob,
            current_balance=current_cash,
            max_capacity=max_capacity,
            hours_to_empty=hours_to_empty,
            withdrawal_velocity=recent_1h_demand,
            is_high_traffic_location="Metro" in payload.get("location", "") or "Airport" in payload.get("location", "")
        )

        recommended_refill = calculate_recommended_refill(
            predicted_daily_demand=recent_24h_demand,
            current_balance=current_cash,
            max_capacity=max_capacity
        )

        return {
            "atm_id": atm_id,
            "cashout_probability": prob,
            "risk_level": risk_level,
            "predicted_cashout": predicted_cashout,
            "estimated_hours_to_empty": hours_to_empty,
            "recommended_action": action,
            "priority_score": priority_score,
            "recommended_refill_amount": recommended_refill
        }

_service_instance = None

def get_prediction_service() -> PredictionService:
    global _service_instance
    if _service_instance is None:
        _service_instance = PredictionService()
    return _service_instance
