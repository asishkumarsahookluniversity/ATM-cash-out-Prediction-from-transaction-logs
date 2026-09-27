"""
ATM Cash-Out Prediction System
Model Utilities & Persistent Weights

Provides lightweight math engines and serialization helpers for:
- Standard Scaler (mean, std normalization)
- Logistic Regression
- Decision Forest / Gradient Boosting models
- JSON serialization for cross-platform zero-dependency interoperability
"""

import json
import math
import os
import random

class StandardScalerWrapper:
    def __init__(self):
        self.means = []
        self.stds = []

    def fit(self, X):
        n_samples = len(X)
        if n_samples == 0:
            return self
        n_features = len(X[0])
        self.means = [0.0] * n_features
        self.stds = [1.0] * n_features

        for j in range(n_features):
            vals = [row[j] for row in X]
            m = sum(vals) / float(n_samples)
            var = sum((v - m) ** 2 for v in vals) / float(n_samples)
            s = math.sqrt(var) if var > 1e-9 else 1.0
            self.means[j] = m
            self.stds[j] = s
        return self

    def transform(self, X):
        return [
            [(row[j] - self.means[j]) / self.stds[j] for j in range(len(row))]
            for row in X
        ]

    def to_dict(self):
        return {"means": self.means, "stds": self.stds}

    @classmethod
    def from_dict(cls, data):
        inst = cls()
        inst.means = data.get("means", [])
        inst.stds = data.get("stds", [])
        return inst

class PureLogisticRegression:
    def __init__(self, lr=0.1, iterations=60, batch_size=256, class_weight_pos=3.0):
        self.lr = lr
        self.iterations = iterations
        self.batch_size = batch_size
        self.class_weight_pos = class_weight_pos
        self.weights = []
        self.bias = 0.0

    def fit(self, X, y):
        n_samples = len(X)
        if n_samples == 0:
            return self
        n_features = len(X[0])
        self.weights = [0.0] * n_features
        self.bias = -0.5

        # Mini-batch gradient descent for fast, accurate convergence
        indices = list(range(n_samples))
        for epoch in range(self.iterations):
            random.shuffle(indices)
            for b_start in range(0, n_samples, self.batch_size):
                batch_idx = indices[b_start : b_start + self.batch_size]
                b_len = len(batch_idx)
                grad_w = [0.0] * n_features
                grad_b = 0.0

                for i in batch_idx:
                    xi = X[i]
                    yi = y[i]
                    z = self.bias + sum(self.weights[j] * xi[j] for j in range(n_features))
                    p = 1.0 / (1.0 + math.exp(-max(-35.0, min(35.0, z))))
                    err = (p - yi) * (self.class_weight_pos if yi == 1 else 1.0)
                    for j in range(n_features):
                        grad_w[j] += err * xi[j]
                    grad_b += err

                step = self.lr / b_len
                for j in range(n_features):
                    self.weights[j] -= step * grad_w[j]
                self.bias -= step * grad_b
        return self

    def predict_proba(self, X):
        probs = []
        for row in X:
            z = self.bias + sum(self.weights[j] * row[j] for j in range(len(row)))
            p = 1.0 / (1.0 + math.exp(-max(-35.0, min(35.0, z))))
            probs.append(p)
        return probs

    def predict(self, X, threshold=0.45):
        return [1 if p >= threshold else 0 for p in self.predict_proba(X)]

    def to_dict(self):
        return {"type": "logistic_regression", "weights": self.weights, "bias": self.bias}

    @classmethod
    def from_dict(cls, data):
        inst = cls()
        inst.weights = data.get("weights", [])
        inst.bias = data.get("bias", 0.0)
        return inst
