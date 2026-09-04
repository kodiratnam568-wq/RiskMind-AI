import random
import pandas as pd

random.seed(42)
data = []
for _ in range(5000):
    amount = round(random.uniform(100,50000), 2)
    transactions_last_hour = random.randint(0, 10)
    is_new_device = random.choice([0, 1])
    is_new_location = random.choice([0, 1])
    location = random.choice([
        "Hyderabad",
        "Guntur",
        "Vijayawada",
        "Chennai",
        "Bangalore",
        "Mumbai",
        "Pune",
        "Delhi"
    ])
    #create a simple fraud pattern for training data
    risk_score = 0
    if amount >=10000:
        risk_score += 30
    if transactions_last_hour >= 5:
        risk_score +=25
    if is_new_device:
        risk_score += 20
    if is_new_location:
        risk_score += 15
    fraud = 1 if risk_score >= 60 else 0
    data.append({
        "amount": amount,
        "location": location,
        "transactions_last_hour": transactions_last_hour,
        "is_new_device": is_new_device,
        "is_new_location": is_new_location,
        "fraud": fraud
    })
df = pd.DataFrame(data)
df.to_csv("data/transactions.csv", index=False)
print("Dataset created successfully!")
print(f"Total transactions:{len(df)}")
print("\nFirst 5 rows:")
print(df.head())
print("\nfraud distribution:")
print(df["fraud"].value_counts())

