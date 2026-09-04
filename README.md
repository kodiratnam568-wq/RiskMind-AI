# 🛡️ RiskMind AI

## AI-Powered Fraud Risk Detection & Transaction Intelligence Platform

RiskMind AI is an AI-powered fraud risk detection platform designed to help merchants identify suspicious transactions, understand risk factors, and make faster transaction decisions.

The system combines a **React/Vite frontend**, **FastAPI backend**, and **Random Forest machine learning model** to analyze transaction behavior and generate a real-time risk assessment.

---

## 🚨 Problem

Digital payment platforms process a large volume of transactions every day.

Fraudulent transactions can lead to:

- Financial losses
- Chargebacks
- Merchant losses
- Customer trust issues
- Increased manual investigation

RiskMind AI aims to provide an intelligent transaction risk assessment system that helps identify potentially suspicious activity and explain why a transaction is considered risky.

---

## 💡 Solution

RiskMind AI analyzes transaction-level information such as:

- Transaction amount
- Location
- Device ID
- Transactions in the last hour
- New device activity
- New location activity

The machine learning model generates a **fraud probability**.

This probability is converted into a **0–100 risk score** and mapped to a risk level.

### 🟢 LOW RISK

**Score: 0–39**

Recommended action:

`ALLOW TRANSACTION`

### 🟡 MEDIUM RISK

**Score: 40–69**

Recommended action:

`REVIEW TRANSACTION`

### 🔴 HIGH RISK

**Score: 70–100**

Recommended action:

`BLOCK TRANSACTION`

---

# ✨ Key Features

### 🔍 Real-Time Transaction Analysis

Analyze transaction information and receive an AI-generated risk assessment through the dashboard.

### 📊 Fraud Probability

The Random Forest model generates a fraud probability for each transaction.

### 🧠 Explainable Risk Factors

RiskMind identifies important transaction signals such as:

- High transaction amount
- High transaction frequency
- New device
- New location

### 🚦 Risk-Based Decisioning

The system converts the model prediction into:

- Low Risk
- Medium Risk
- High Risk

and provides a recommended action.

### 📋 Transaction Monitoring

All transactions analyzed during the current dashboard session are displayed in the transaction history section.

### 🤖 AI Risk Analyst

Provides a natural-language explanation of the current transaction risk.

### 💬 Risk Intelligence Copilot

The copilot can answer questions about:

- Why a transaction is risky
- Detected risk factors
- Fraud probability
- Risk score
- Recommended action

### 📈 Model Evaluation

The platform displays:

- Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix

### ⚙️ System Settings

Provides configuration for:

- Risk notifications
- Automatic blocking recommendations
- AI engine status
- API status

---

# 🏗️ System Architecture

┌──────────────────────────────┐
│       React + Vite           │
│      RiskMind Dashboard      │
└──────────────┬───────────────┘
               │
               │ HTTP POST /analyze
               ▼
┌──────────────────────────────┐
│          FastAPI             │
│         Backend API          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Random Forest Model      │
│     Fraud Risk Prediction    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Risk Intelligence       │
│                              │
│  • Fraud Probability         │
│  • Risk Score                │
│  • Risk Level                │
│  • Risk Factors              │
│  • Recommended Action        │
└──────────────────────────────┘

## 🧠 Machine Learning

RiskMind AI currently uses a Random Forest Classifier.

Input Features
-amount
-location
-transactions_last_hour
-is_new_device
-is_new_location

Model Output
-prediction
-fraud_probability
The backend uses the model probability to generate the transaction risk score.

## 📊 Model Evaluation

The current model was evaluated using a held-out test dataset.

Metric	              Result
Accuracy            	100%
Precision	            100%
Recall	                100%
F1 Score	            100%
True Negatives         	 562
False Positives	           0
False Negatives            0
True Positives	         438

## ⚠️ Evaluation Note

The current transaction dataset is synthetically generated.
The fraud labels are based on predefined transaction-risk conditions used during dataset generation.
Therefore, these results represent performance on the current synthetic test dataset and should not be interpreted as real-world fraud detection performance.

## 🛠️ Tech Stack
# Frontend
-React
-Vite
-JavaScript
-CSS
# Backend
-Python
-FastAPI
-Pydantic
-Uvicorn
# Machine Learning
-Scikit-learn
-Random Forest
-Pandas
-NumPy
-Joblib
# Development
-Git
-GitHub
-PyCharm / VS Code

📁 Project Structure

RiskMind-AI/
│
├── backend/
│   ├── __init__.py
│   ├── main.py
│   └── models.py
│
├── data/
│   ├── generate_data.py
│   └── transactions.csv
│
├── ml/
│   ├── __init__.py
│   ├── eda.py
│   ├── train_model.py
│   ├── evaluate_model.py
│   ├── risk_model.py
│   └── risk_model.pkl
│
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── index.css
│
├── requirements.txt
├── .gitignore
└── README.md

🖥️ Dashboard Modules
Dashboard
│
├── Transaction Analysis
├── Risk Assessment
├── AI Risk Analyst
├── Risk Factors
├── Model Evaluation
└── Risk Intelligence Copilot
Transactions
│
└── Transaction History
Risk Intelligence
│
├── Risk Decision Framework
├── Detection Signals
└── Explainable AI
Model Evaluation
│
├── Accuracy
├── Precision
├── Recall
├── F1 Score
└── Confusion Matrix
Settings
│
├── AI Engine
├── API Status
├── Automatic Blocking
└── Risk Notifications

## 🔐 Security & Intended Use

RiskMind AI is designed as a defensive fraud-risk intelligence system.
It is intended to help merchants identify potentially suspicious transactions and support safer transaction decisions.
The system is not designed for offensive fraud activity.

## 🚀 Future Improvements

Real-world fraud datasets
Model calibration
Advanced anomaly detection
Persistent transaction database
Real LLM-powered risk copilot
RAG-based fraud intelligence
User authentication
Merchant-specific risk profiles
Real-time transaction monitoring
Cloud deployment
Improved explainability
Cost-aware risk decisioning

## 🎯 Project Goal

RiskMind AI demonstrates how machine learning and AI-powered decision support can help merchants:
Detect → Understand → Decide 
The goal is to reduce potential financial losses while giving analysts clear explanations behind transaction-risk decisions.