# ATM CASH-OUT PREDICTION & FLEET MONITORING SYSTEM

> **Transaction Log Based ATM Cash-Out Prediction, Risk Monitoring, and Replenishment Optimization**

A production-grade, end-to-end Machine Learning web application and analytics platform designed for commercial banks and ATM cash logistics operators. Predicts ATM cash-outs before they happen, ranks terminals by refill priority, minimizes cash logistics costs, and prevents customer service disruption.

---

## 1. Project Overview & Problem Statement

Commercial banks manage hundreds of Automated Teller Machines (ATMs). Each machine has a physical vault capacity (typically $70,000 to $150,000) and receives periodic cash replenishments from armored logistics carriers. However, cash withdrawal demand fluctuates dramatically based on:
- Time of day (lunch and evening peaks)
- Day of week (Friday evening surges, high weekend demand)
- Location characteristics (transit stations and shopping malls vs. residential branches)
- Replenishment delays or holidays

### The Cost of Poor Cash Management
1. **Stockouts / Cash-Outs:** Customers arrive to find an ATM empty, leading to service disruption, lost interchange revenue, and reputational damage.
2. **Excess Cash Idling:** Loading too much cash ties up expensive bank capital without earning interest.
3. **Emergency Courier Refills:** Unplanned, emergency refills cost 3x–5x more than scheduled truck routes.

### Solution
This system continuously analyzes historical transaction logs, engineers temporal and rolling withdrawal features, predicts the probability of a terminal running out of cash within the next 24 hours using trained Machine Learning models (Gradient Boosting, Random Forest, Logistic Regression), and generates an automated, priority-ranked replenishment schedule.

---

## 2. Technology Stack

- **Backend / Machine Learning:**
  - Python 3.10+ / 3.11+
  - FastAPI (REST API with OpenAPI documentation)
  - Scikit-Learn & NumPy (Algorithms, StandardScaler, Confusion Matrix, ROC-AUC)
  - Pydantic (Request and response validation)
  - SQLite / SQLAlchemy (Relational storage for terminals, logs, and alerts)
- **Frontend & Visualization:**
  - React 19 (SPA with functional components and hooks)
  - Vite 8 & TypeScript
  - Tailwind CSS v4 (Modern fintech dark theme)
  - Recharts (Interactive Area charts, Donut charts, Bar charts, and ROC curves)
  - Lucide React (Fintech iconography)

---

## 3. System Architecture

```
                               ┌────────────────────────────────┐
                               │       Web Dashboard (React)    │
                               └──────────────┬─────────────────┘
                                              │ REST API
                               ┌──────────────▼─────────────────┐
                               │    Backend API (FastAPI/Node)  │
                               └──────────────┬─────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
┌─────────────▼──────────────┐  ┌─────────────▼──────────────┐  ┌─────────────▼──────────────┐
│     Prediction Service     │  │   Risk & Refill Engine     │  │     Database & Logs        │
│ (Scalers, Weights, Prob)   │  │ (Priority Score, Routing)  │  │(ATMs, Transactions, Alerts)│
└─────────────┬──────────────┘  └─────────────┬──────────────┘  └────────────────────────────┘
              │                               │
┌─────────────▼───────────────────────────────▼──────────────┐
│          Offline / Scheduled ML Training Pipeline          │
│   (Dataset -> Preprocessing -> Chronological Time-Split    │
│    -> Model Training -> Recall Evaluation -> Saved Models) │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Machine Learning Methodology

### 4.1 Chronological Time-Based Split (Preventing Data Leakage)
Standard random `train_test_split` causes **data leakage** in time-series and transaction logs because future records leak into the past. 
We strictly implement a chronological split:
- **70% Earliest Data:** Model Training
- **15% Intermediate Data:** Validation & Hyperparameter Tuning
- **15% Most Recent Data:** Hold-out Test Evaluation

### 4.2 Target Variable Definition (`cashout_risk`)
Target variable `cashout_risk = 1` if within the subsequent 24-hour prediction horizon:
1. The ATM's remaining cash balance drops below the configurable minimum threshold: `MIN_CASH_THRESHOLD = $15,000`, OR
2. The terminal experiences a failed transaction (`WITHDRAWAL_FAILED`) due to insufficient cash canister inventory, OR
3. Current burn rate depletes the vault within 24 hours: `hours_to_empty <= 24.0`.
Otherwise, `cashout_risk = 0`.

### 4.3 Engineered Features
- **Temporal Features:** `hour`, `day_of_week`, `is_weekend`, `is_friday_evening`
- **Rolling Windows (Strictly Backward-Looking):** `withdrawal_1h`, `withdrawal_3h`, `withdrawal_6h`, `withdrawal_12h`, `withdrawal_24h`
- **Velocity & Acceleration:** `transaction_velocity` ($/hr rate), `demand_growth_rate` (ratio of 3h to 24h average)
- **Cash & Volatility:** `current_balance`, `time_since_last_refill`, `estimated_daily_demand`, `estimated_hours_to_empty`
- **Location Baselines:** `atm_avg_daily_demand`, `atm_peak_hour_demand`

### 4.4 Model Comparison & Evaluation
Cash-out prediction is an asymmetric risk problem: missing an empty ATM (**False Negative**) is vastly more costly to a bank than dispatching an armored truck slightly early (**False Positive**). Therefore, model selection prioritizes:
1. **RECALL** on the Cash-Out class
2. **F1-Score**
3. **ROC-AUC**

| Model Architecture | Accuracy | Precision | Recall (Primary) | F1-Score | ROC-AUC | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gradient Boosting (GBDT)** | **96.04%** | **91.25%** | **94.32%** | **92.76%** | **0.9892** | **SELECTED** |
| **Random Forest** | 96.17% | 90.10% | 92.05% | 91.06% | 0.9890 | Candidate |
| **Logistic Regression** | 94.58% | 81.20% | 94.32% | 87.27% | 0.9890 | Candidate |

---

## 5. Refill Recommendation Formula

The required cash replenishment is dynamically calculated:
$$\text{Recommended Refill} = (\text{Predicted Daily Demand} \times \text{Safety Days}) + \text{Safety Stock Buffer} - \text{Current Balance}$$
- **Safety Days:** Configurable multiplier (default: 2.5 days of replenishment lead time).
- **Safety Stock Buffer:** Percentage cushion against demand volatility (default: 20%).
- **Constraints:** Clamped by maximum canister capacity ($70,000–$150,000) and rounded to standard $5,000 bank cassette bundle increments.

---

## 6. Project Structure

```
├── backend/
│   ├── database.py              # SQLite table initialization and session management
│   ├── main.py                  # FastAPI application entrypoint with CORS & routes
│   ├── models.py                # Data classes and entity records
│   ├── schemas.py               # Pydantic request/response validation schemas
│   ├── routes/
│   │   ├── dashboard.py         # KPIs, risk summary, and model metrics endpoints
│   │   ├── prediction.py        # Single & batch prediction endpoints
│   │   ├── transactions.py      # ATM fleet and transaction log endpoints
│   │   └── upload.py            # CSV upload and ML training triggers
│   └── services/
│       ├── feature_engineering.py # Real-time feature vector transformation
│       ├── prediction_service.py  # Model inference and boundary calibration
│       ├── refill_engine.py       # Safety stock replenishment formulas
│       └── risk_engine.py         # Multi-factor priority score calculation
│
├── ml/
│   ├── generate_dataset.py      # 50,000+ realistic transaction log generator
│   ├── preprocess.py            # Leakage-free backward rolling window extractor
│   ├── evaluate.py              # Precision, Recall, F1, ROC-AUC, Confusion Matrix
│   ├── model_utils.py           # StandardScaler and ML inference engine
│   └── train.py                 # Chronological time-split training pipeline
│
├── models/
│   ├── feature_columns.json     # Feature names and ordering
│   ├── model_metrics.json       # Test set evaluation benchmarks & confusion matrix
│   ├── model_weights.json       # Serialized model parameters and weights
│   └── scaler.json              # Standard scaler means and standard deviations
│
├── data/
│   └── atm_transactions.csv     # Historical ATM transaction logs
│
├── tests/
│   ├── test_features.py         # Unit tests for feature extraction and refill engine
│   ├── test_prediction.py       # Unit tests for inference and risk classification
│   └── test_api.py              # Unit tests for CSV validation and API schemas
│
├── src/                         # React 19 Frontend
│   ├── components/              # KPICards, RiskDonutChart, Navbar, Sidebar, RefillModal
│   ├── views/                   # Dashboard, ATMs, Detail, Predictions, Logistics, Metrics, Upload, Settings
│   ├── App.tsx                  # Main app container and view routing
│   └── index.css                # Tailwind CSS v4 styles
│
├── server.ts                    # Full-Stack Node/Express server with Vite dev middlewares
├── requirements.txt             # Python dependencies
├── package.json                 # Node.js dependencies
└── README.md                    # Project documentation
```

---

## 7. How to Run (Step-by-Step)

### Option A: Running Full-Stack Dev Server (Default AI Studio Environment)
```bash
# 1. Install frontend dependencies
npm install

# 2. Launch Full-Stack Server on port 3000
npm run dev
```
Open your browser at `http://localhost:3000`.

### Option B: Running Python FastAPI Backend (Windows / Linux)

#### 1. Setup Python Virtual Environment
**Windows:**
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. Generate Dataset & Train ML Models
```bash
# Generate 50,000+ realistic transaction logs
python ml/generate_dataset.py

# Train models with chronological time-based split
python ml/train.py

# Run unit test suite
python -m unittest discover -s tests
```

#### 3. Run FastAPI Backend
```bash
uvicorn backend.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

---

## 8. API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and database status |
| `GET` | `/api/dashboard` | Fleet KPIs, risk distribution, urgent terminals |
| `GET` | `/api/atms` | Full list of 50 ATMs with search, sort, and filters |
| `GET` | `/api/atms/{atm_id}` | Detailed telemetry (hourly drawdowns, 7d trends, refill history) |
| `POST` | `/api/predict` | Real-time cashout probability inference for custom input |
| `POST` | `/api/predict/batch` | Batch inference across all network ATMs |
| `GET` | `/api/refill-recommendations` | Armored carrier routing schedule & prioritized refill queue |
| `POST` | `/api/atms/{atm_id}/refill` | Dispatch immediate cash reload to specified terminal |
| `GET` | `/api/transactions` | Paginated transaction logs |
| `GET` | `/api/metrics` | Model comparison, Confusion Matrix, and Feature Importances |
| `POST` | `/api/upload` | Upload new CSV transaction logs |
| `POST` | `/api/train` | Trigger model retraining pipeline |
| `GET/POST`| `/api/settings` | Retrieve and update operational thresholds |

---

## 9. Academic & Presentation Notes (Viva / Review)

1. **Why Chronological Split?**
   Random sampling leaks future demand into past training, causing artificially high test scores that fail in production. Chronological splitting ensures the test set is strictly in the future.
2. **Why Prioritize Recall Over Accuracy?**
   Because an empty ATM causes direct monetary and reputation loss, the cost matrix heavily penalizes False Negatives. Recall measures what percentage of actual cash-outs the model successfully caught.
3. **Data Leakage Safeguards:**
   Features like `w_24h` and `transaction_velocity` only look backward from the transaction timestamp. The prediction target looks forward strictly into the next 24-hour horizon.
