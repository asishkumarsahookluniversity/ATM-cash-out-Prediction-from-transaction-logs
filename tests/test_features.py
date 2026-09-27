"""
Unit tests for Feature Engineering & Preprocessing
"""

import unittest
import os
from ml.preprocess import Preprocessor
from backend.services.feature_engineering import extract_features_from_input, FEATURE_ORDER
from backend.services.risk_engine import classify_risk, calculate_priority_score
from backend.services.refill_engine import calculate_recommended_refill

class TestFeatureEngineering(unittest.TestCase):
    def test_feature_extraction_order_and_length(self):
        payload = {
            "current_cash": 20000.0,
            "recent_1h_demand": 3000.0,
            "recent_6h_demand": 12000.0,
            "recent_24h_demand": 40000.0,
            "hour": 15,
            "day_of_week": 4
        }
        features = extract_features_from_input(payload)
        self.assertEqual(len(features), len(FEATURE_ORDER))
        # Ensure non-negative numbers
        self.assertGreaterEqual(features[3], 0.0) # current_cash

    def test_risk_classification(self):
        self.assertEqual(classify_risk(0.15), "LOW")
        self.assertEqual(classify_risk(0.45), "MEDIUM")
        self.assertEqual(classify_risk(0.72), "HIGH")
        self.assertEqual(classify_risk(0.92), "CRITICAL")

    def test_refill_calculation_positive_need(self):
        # 30,000 daily demand, 10,000 balance, 2.5 safety days -> needs refill
        refill = calculate_recommended_refill(
            predicted_daily_demand=30000.0,
            current_balance=10000.0,
            max_capacity=120000.0
        )
        self.assertGreater(refill, 0.0)
        self.assertLessEqual(refill, 110000.0)

    def test_refill_calculation_full_machine(self):
        # Already full ATM -> 0 refill needed
        refill = calculate_recommended_refill(
            predicted_daily_demand=15000.0,
            current_balance=120000.0,
            max_capacity=120000.0
        )
        self.assertEqual(refill, 0.0)

    def test_priority_score_ordering(self):
        # Critical low balance ATM should score much higher than full ATM
        score_urgent = calculate_priority_score(
            probability=0.90,
            current_balance=5000.0,
            max_capacity=100000.0,
            hours_to_empty=2.5,
            withdrawal_velocity=3500.0
        )
        score_safe = calculate_priority_score(
            probability=0.10,
            current_balance=95000.0,
            max_capacity=100000.0,
            hours_to_empty=72.0,
            withdrawal_velocity=400.0
        )
        self.assertGreater(score_urgent, score_safe)

if __name__ == "__main__":
    unittest.main()
