"""
Unit tests for Prediction Service and ML Model Loading
"""

import unittest
import os
import json
from backend.services.prediction_service import PredictionService

class TestPredictionService(unittest.TestCase):
    def setUp(self):
        self.service = PredictionService()

    def test_predict_single_high_risk(self):
        # ATM with $8,000 balance and heavy 24h demand ($40,000)
        req = {
            "atm_id": "ATM005",
            "current_cash": 8000.0,
            "recent_1h_demand": 4200.0,
            "recent_6h_demand": 16000.0,
            "recent_24h_demand": 42000.0,
            "withdrawal_rate": 22.0,
            "hours_since_refill": 68.0,
            "location": "Airport Terminal 1"
        }
        res = self.service.predict_one(req)
        self.assertIn("cashout_probability", res)
        self.assertIn("risk_level", res)
        self.assertIn(res["risk_level"], ["HIGH", "CRITICAL"])
        self.assertTrue(res["predicted_cashout"])
        self.assertGreater(res["recommended_refill_amount"], 50000.0)

    def test_predict_single_low_risk(self):
        # ATM with $95,000 balance and light demand
        req = {
            "atm_id": "ATM042",
            "current_cash": 95000.0,
            "recent_1h_demand": 400.0,
            "recent_6h_demand": 2100.0,
            "recent_24h_demand": 9500.0,
            "withdrawal_rate": 3.0,
            "hours_since_refill": 8.0,
            "location": "Suburban Branch"
        }
        res = self.service.predict_one(req)
        self.assertEqual(res["risk_level"], "LOW")
        self.assertFalse(res["predicted_cashout"])
        self.assertEqual(res["recommended_action"], "MONITOR")
        self.assertEqual(res["recommended_refill_amount"], 0.0)

if __name__ == "__main__":
    unittest.main()
