"""
Tests for API Endpoints and Validation
"""

import unittest
import os
import json
from ml.preprocess import Preprocessor

class TestAPIValidation(unittest.TestCase):
    def setUp(self):
        self.preprocessor = Preprocessor()

    def test_missing_csv_file(self):
        with self.assertRaises(FileNotFoundError):
            self.preprocessor.validate_csv("data/non_existent_file.csv")

    def test_sample_csv_validation(self):
        csv_path = "data/atm_transactions.csv"
        if os.path.exists(csv_path):
            stats = self.preprocessor.validate_csv(csv_path)
            self.assertTrue(stats["valid"])
            self.assertGreater(stats["total_rows"], 1000)
            self.assertIn("ATM_ID", stats["headers"])
            self.assertIn("Timestamp", stats["headers"])

if __name__ == "__main__":
    unittest.main()
