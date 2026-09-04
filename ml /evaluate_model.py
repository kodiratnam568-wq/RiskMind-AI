import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)


# Load dataset
df = pd.read_csv("data/transactions.csv")

# Features and target
X = df.drop("fraud", axis=1)
y = df["fraud"]

# Same split used during training
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Load trained model
model = joblib.load("ml/risk_model.pkl")

# Predictions
y_pred = model.predict(X_test)

# Metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

# Confusion matrix
tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

print("========= RISKMIND AI MODEL EVALUATION =========")

print(f"Test transactions: {len(X_test)}")

print(f"\nAccuracy:  {accuracy * 100:.2f}%")
print(f"Precision: {precision * 100:.2f}%")
print(f"Recall:    {recall * 100:.2f}%")
print(f"F1 Score:  {f1 * 100:.2f}%")

print("\n========= CONFUSION MATRIX =========")
print(f"True Negatives:  {tn}")
print(f"False Positives: {fp}")
print(f"False Negatives: {fn}")
print(f"True Positives:  {tp}")

# Example business cost assumptions
FALSE_POSITIVE_COST = 100
FALSE_NEGATIVE_COST = 1000

total_fp_cost = fp * FALSE_POSITIVE_COST
total_fn_cost = fn * FALSE_NEGATIVE_COST
total_cost = total_fp_cost + total_fn_cost

print("\n========= FALSE-POSITIVE COST =========")
print(f"False-positive cost per transaction: ₹{FALSE_POSITIVE_COST}")
print(f"False-negative cost per transaction: ₹{FALSE_NEGATIVE_COST}")

print(f"\nFalse-positive cost: ₹{total_fp_cost}")
print(f"False-negative cost: ₹{total_fn_cost}")
print(f"Total estimated error cost: ₹{total_cost}")

print("\n========= CLASSIFICATION REPORT =========")
print(classification_report(y_test, y_pred))
