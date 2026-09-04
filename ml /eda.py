import pandas as pd

#Load dataset
df = pd.read_csv("data/transactions.csv")

print("========= DATASET OVERVIEW =========")

print(f"Total transactions: {len(df)}")
print(f"Total features: {len(df.columns)}")

print("\n========= COLUMNS =========")
print(df.columns.tolist())

print("\n========= DATA TYPES =========")
print(df.dtypes)

print("\n========= MISSING VALUES =========")
print(df.isnull().sum())

print("\n========= STATISTICS =========")
print(df.describe())

print("\n========= FRAUD DISTRIBUTION =========")
print(df["fraud"].value_counts())

print("\n========== FRAUD PERCENTAGE =========")
print(df["fraud"].value_counts(normalize=True) * 100)

print("\n========= AVERAGE AMOUNT =========")
print(df.groupby("fraud")["amount"].mean())

print("\n========== AVERAGE TRANSACTIONS PER HOUR =========")
print(df.groupby("fraud")["transactions_last_hour"].mean())

print("\n========== NEW DEVICE VS FRAUD =========")
print(pd.crosstab(df["is_new_device"], df["fraud"]))

print("\n========= NEW LOCATION VS FRAUD =========")
print(pd.crosstab(df["is_new_location"], df["fraud"]))
