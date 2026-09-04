Animus AI
AI-Powered Fraud Risk Management & Transaction Intelligence
Animus AI is a fraud risk management platform that analyzes transaction behavior, estimates fraud probability, and converts model predictions into actionable **ALLOW, REVIEW, or BLOCK** decisions.
The system combines machine learning, behavioral feature engineering, explainable AI, and transaction analytics into a full-stack application designed around defensive fraud detection.
---
Problem
Online payment systems need to identify potentially fraudulent transactions without unnecessarily blocking legitimate customers.
A fraud detection system therefore has to balance two competing risks:
- **False negatives** — fraudulent transactions that are allowed through.
- **False positives** — legitimate transactions that are incorrectly flagged.
Animus AI approaches this as a **risk management problem**, rather than simply trying to maximize classification accuracy.
---
Solution
Animus analyzes behavioral transaction signals and produces a fraud probability using an **XGBoost** model.
The predicted probability is then passed through a configurable risk policy:
| Fraud Probability | Risk Level | Decision |
|---:|---|---|
| ≥ 0.90 | HIGH | BLOCK |
| 0.87 – 0.89 | MEDIUM-HIGH | REVIEW |
| 0.50 – 0.86 | MEDIUM | REVIEW |
| < 0.50 | LOW | ALLOW |
The system also provides SHAP-based explanations showing which behavioral signals contributed most to the prediction.
---
Key Features
- **Fraud probability scoring**
- **ALLOW / REVIEW / BLOCK decisions**
- **26 behavioral transaction features**
- **XGBoost fraud detection**
- **SHAP explainability**
- **Risk-level classification**
- **Transaction history**
- **Risk analytics dashboard**
- **Transaction value exposure analysis**
- **JWT-based authentication**
- **User-specific transaction isolation**
- **Temporal train / validation / test evaluation**
- **Precision, recall, F1, PR-AUC and ROC-AUC evaluation**
- **False-positive cost and threshold analysis**
- **Separate benchmark evaluation on a second fraud dataset**
---
Architecture
Animus follows an end-to-end architecture connecting the frontend, backend, fraud detection service, risk policy, explainability layer, and database.
![Animus AI Architecture](docs/architecture.png)
Application Flow
```text
User
  │
  ▼
React Frontend
  │
  │ REST API
  ▼
FastAPI Backend
  │
  ├──────────────► Authentication / JWT
  │
  ├──────────────► SQLite Database
  │                 ├── Users
  │                 └── Transactions
  │
  ▼
Fraud Detection Service
  │
  ├── 26 Behavioral Features
  │
  ├── XGBoost Model
  │
  └── SHAP Explainer
  │
  ▼
Fraud Probability
  │
  ▼
Risk Policy
  │
  ├── ALLOW
  ├── REVIEW
  └── BLOCK
  │
  ▼
Risk Dashboard
  ├── Explanation
  ├── Analytics
  └── Transaction History
```
---
Machine Learning Pipeline
```text
Raw Transaction Data
        │
        ▼
Data Cleaning
        │
        ▼
Temporal Train / Validation / Test Split
        │
        ▼
Behavioral Feature Engineering
        │
        ▼
26 Engineered Features
        │
        ▼
XGBoost Training
        │
        ▼
Threshold & Cost Analysis
        │
        ▼
Final Fraud Detection Model
        │
        ▼
Held-Out Test Evaluation
        │
        ▼
Precision / Recall / PR-AUC / ROC-AUC
```
---
Behavioral Features
Animus uses behavioral signals rather than relying only on individual transaction attributes.
Examples include:
- Customer transaction count before the current transaction
- Customer average transaction amount
- Customer amount deviation
- Customer amount ratio
- Terminal transaction count
- Terminal average transaction amount
- Historical terminal behavior
- Other transaction-level and historical behavioral signals
These features allow the model to evaluate a transaction in the context of previously observed behavior.
---
Model
Primary Model
**XGBoost**
The primary Animus model was trained using engineered behavioral features and evaluated using a chronological/temporal split.
The final model uses:
- 26 engineered features
- 400 estimators
- Maximum tree depth: 6
- Learning rate: 0.08
- Subsample: 0.8
- Column sampling: 0.8
- Class weighting through `scale_pos_weight`
- Decision threshold: 0.87
The threshold was selected as part of a cost-sensitive risk policy rather than simply using the default 0.50 classification threshold.
---
Model Performance
Dataset A — Handbook Fraud Detection Dataset
The primary model was evaluated on a held-out September test period.
| Metric | Result |
|---|---:|
| PR-AUC | **0.3169** |
| ROC-AUC | **0.6634** |
| Precision | **84.75%** |
| Recall | **30.11%** |
| F1 Score | **0.4444** |
Held-Out Confusion Matrix
| | Predicted Legitimate | Predicted Fraud |
|---|---:|---:|
| Actual Legitimate | 286,968 | 138 |
| Actual Fraud | 1,780 | 767 |
The results demonstrate the tradeoff between catching fraudulent activity and limiting false positives.
---
Generalization Benchmark
Animus was also evaluated separately using the **IEEE-CIS fraud dataset**.
| Metric | Result |
|---|---:|
| PR-AUC | **0.1879** |
| ROC-AUC | **0.7882** |
| Precision | **17.25%** |
| Recall | **43.56%** |
| F1 Score | **0.2471** |
This benchmark is kept separate from the primary model evaluation to demonstrate how the approach behaves on a different fraud dataset.
---
Risk & Cost Analysis
Fraud detection involves a business tradeoff.
A system that blocks too aggressively may frustrate legitimate customers, while a system that is too permissive may allow more fraudulent transactions.
Animus therefore evaluates different decision thresholds using **illustrative false-positive and false-negative costs**.
Example threshold analysis:
| False Positive Cost | False Negative Cost | Selected Threshold |
|---:|---:|---:|
| ₹10 | ₹500 | 0.70 |
| ₹50 | ₹500 | **0.87** |
| ₹200 | ₹500 | 0.92 |
These costs are **illustrative assumptions for demonstrating the decision tradeoff** and do not represent internal Razorpay loss figures.
---
Explainable AI
Animus uses **SHAP (SHapley Additive exPlanations)** to explain individual predictions.
For each analyzed transaction, the system can identify:
- Signals that increased risk
- Signals that reduced risk
- The magnitude of each signal's contribution
- A human-readable explanation of the result
Examples of important behavioral signals include:
- Terminal transaction count
- Customer amount ratio
- Terminal average amount
- Customer amount deviation
- Customer transaction count
- Customer average amount
SHAP contributions are used to explain the model's prediction and should not be interpreted as percentages of fraud probability.
---
Risk Analytics
The dashboard provides an overview of analyzed transaction activity, including:
- Total transactions
- Flagged transactions
- Flagged transaction rate
- Total transaction value
- Flagged transaction value
- Flagged value percentage
- Blocked transactions
- Blocked transaction value
- Transactions sent for review
- Review transaction value
- Risk-level distribution
This allows the system to communicate both **transaction risk** and **financial exposure**.
---
Authentication & Data Isolation
Animus includes JWT-based authentication.
Each authenticated user receives access only to their own transaction data.
```text
User
 │
 ▼
Login
 │
 ▼
JWT Access Token
 │
 ▼
Protected API
 │
 ▼
Authenticated User ID
 │
 ├── Prediction
 ├── Transaction History
 └── Analytics
```
Transactions are stored with their associated user ID, preventing one user's transaction history and analytics from being exposed to another user.
---
Tech Stack
Frontend
- React
- TypeScript
- Vite
- CSS
Backend
- Python
- FastAPI
- SQLite
- JWT Authentication
Machine Learning
- XGBoost
- Scikit-learn
- SHAP
- Pandas
- NumPy
Development
- Jupyter Notebook
- Git
- GitHub
---
Project Structure
```text
animus-ai/
│
├── app/
│   ├── main.py
│   ├── schemas/
│   ├── services/
│   │   └── fraud_detector.py
│   ├── utils/
│   └── db/
│       └── database.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── models/
│   ├── animus_dataset_b_xgboost.pkl
│   ├── animus_dataset_b_config.pkl
│   ├── animus_model_config.pkl
│   └── animus_xgboost.pkl
│
├── notebooks/
│   └── 01_data_exploration.ipynb
│
├── data/
│   ├── handbook/
│   ├── ieee_cis/
│   └── processed/
│
├── docs/
│   └── architecture.png
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```
---
Running Animus Locally
1. Clone the repository
```bash
git clone <https://github.com/ChandramouliJoshi/animus.ai.git>
cd animus-ai
```
2. Create the Python environment
```bash
python -m venv animus
```
Activate it on Windows:
```bash
animus\Scripts\activate
```
3. Install backend dependencies
```bash
pip install -r requirements.txt
```
4. Configure environment variables
Create a `.env` file in the project root:
```env
JWT_SECRET_KEY=your-secret-key
```
Do not commit the `.env` file.
5. Start the backend
```bash
uvicorn app.main:app --reload
```
The API will run on:
```text
http://127.0.0.1:8000
```
6. Start the frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on the Vite development server.
---
API
The backend exposes endpoints for:
```text
POST /auth/signup
POST /auth/login
GET  /auth/me
POST /predict
GET  /transactions
GET  /analytics
```
Protected endpoints require a valid JWT bearer token.
---
Defense-Only Design
Animus AI is designed strictly for **fraud detection and prevention**.
The system does not provide functionality for:
- Performing fraudulent transactions
- Bypassing fraud detection
- Exploiting payment systems
- Generating attack strategies
- Evading security controls
Its purpose is to help identify and manage potentially fraudulent transaction activity.
---
Limitations
Animus is a research/prototype system and does not currently connect to a live payment processing network.
The prediction API expects engineered behavioral features rather than deriving all historical signals directly from raw payment events.
The reported financial costs are illustrative assumptions used for threshold analysis and should not be interpreted as real-world loss estimates.
---
Future Improvements
Potential production extensions include:
- Real-time transaction event ingestion
- Automated behavioral feature generation
- Streaming fraud detection
- Model monitoring and drift detection
- Feedback loops from confirmed fraud outcomes
- Human review workflows
- Model versioning
- Feature store integration
- Distributed transaction storage
- Production-grade secrets management
- Automated model retraining
---
Project Goal
Animus AI demonstrates how a machine-learning fraud classifier can be developed into a complete **risk management system** that combines:
**Detect → Decide → Explain → Monitor**
The goal is not simply to classify transactions, but to provide an actionable and explainable system for managing fraud risk.

