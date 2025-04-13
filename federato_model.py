#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import pandas as pd
import numpy as np
from collections import defaultdict, Counter
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import os

# Load all CSV files in the 'data' folder
data_folder = 'data'
csv_files = [f for f in os.listdir(data_folder) if f.endswith('.csv')]

# Read and concatenate all CSVs
df_list = []
for file in csv_files:
    df = pd.read_csv(os.path.join(data_folder, file))
    df_list.append(df)
df = pd.concat(df_list, ignore_index=True)

# Preprocess the data
df['event_time'] = pd.to_datetime(df['event_time'])
df = df.sort_values(by=['session_id', 'event_time'])

# Group events by session
paths = defaultdict(list)
session_lengths = {}
for session_id, group in df.groupby('session_id'):
    paths[session_id] = group['event_type'].tolist()
    session_lengths[session_id] = len(group)

# Create training data
X, y = [], []
for session_id, path in paths.items():
    session_length = session_lengths[session_id]
    for i in range(len(path) - 1):
        X.append((path[max(0, i-12):i+1], session_length))  
        y.append(path[i+1])

# Convert sequences to feature vectors
label_encoder = LabelEncoder()
all_events = df['event_type'].unique()
label_encoder.fit(all_events)

def encode_sequence(seq, session_length):
    encoded = [label_encoder.transform([event])[0] if event in label_encoder.classes_ else -1 for event in seq]
    padded_sequence = [0] * (13 - len(encoded)) + encoded  
    return padded_sequence + [session_length]  

X = np.array([encode_sequence(seq, length) for seq, length in X])
y = label_encoder.transform(y)

# Remove rare classes (less than 2 occurrences)
counts = Counter(y)
rare_classes = {cls for cls, count in counts.items() if count < 2}
valid_indices = [i for i in range(len(y)) if y[i] not in rare_classes]
X, y = X[valid_indices], y[valid_indices]

# Re-map labels to continuous range
unique_classes = sorted(set(y))
class_mapping = {old: new for new, old in enumerate(unique_classes)}
y = np.array([class_mapping[label] for label in y])

# Split into training and testing data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Train an XGBoost Classifier
clf = XGBClassifier(n_estimators=400, learning_rate=0.03, max_depth=9, random_state=42)
clf.fit(X_train, y_train)

# Predict and calculate accuracy
y_pred = clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

