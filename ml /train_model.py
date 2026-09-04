import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv("data/transactions.csv")

print("Dataset loaded successfully!")
print("Total records:", len(df))


# ==========================================
# 2. SEPARATE FEATURES AND TARGET
# ==========================================

X = df.drop("fraud", axis=1)
y = df["fraud"]

print("\nFeatures:")
print(X.columns.tolist())

print("\nTarget:")
print("fraud")


# ==========================================
# 3. DEFINE COLUMN TYPES
# ==========================================

categorical_features = ["location"]

numeric_features = [
    "amount",
    "transactions_last_hour",
    "is_new_device",
    "is_new_location"
]


# ==========================================
# 4. PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "location",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# ==========================================
# 5. CREATE ML MODEL
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# ==========================================
# 6. CREATE COMPLETE PIPELINE
# ==========================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


# ==========================================
# 7. SPLIT DATA
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# ==========================================
# 8. TRAIN MODEL
# ==========================================

print("\nTraining Random Forest model...")

pipeline.fit(X_train, y_train)

print("Model training completed!")


# ==========================================
# 9. TEST MODEL
# ==========================================

y_pred = pipeline.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\n========= MODEL RESULTS =========")
print("Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# ==========================================
# 10. SAVE MODEL
# ==========================================

joblib.dump(
    pipeline,
    "ml/risk_model.pkl"
)

print("\nML model saved successfully!")
print("File: ml/risk_model.pkl")
