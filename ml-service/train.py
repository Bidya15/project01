import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os

def train_model():
    dataset_path = 'processed_real_dataset.csv'
    
    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found. Ensure dataset is collected and processed.")
        # For demonstration purposes, if dataset missing, we skip execution
        return

    # Load dataset
    df = pd.read_csv(dataset_path)
    df = df.dropna()
    
    X = df.drop('label', axis=1)
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training Production-Ready Model on {len(X_train)} samples...")
    
    # Random Forest with tuned hyperparameters
    clf = RandomForestClassifier(
        n_estimators=300, 
        max_depth=20, 
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    # Evaluation
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]
    
    print("\n--- Model Performance Metrics ---")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1-Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, y_prob):.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature Importance Visualization (Console)
    importances = clf.feature_importances_
    features = X.columns
    indices = np.argsort(importances)[::-1]
    
    print("\nTop Features by Importance:")
    for f in range(min(10, X.shape[1])):
        print(f"{f + 1}. {features[indices[f]]}: {importances[indices[f]]:.4f}")
    
    # Save the model
    joblib.dump(clf, 'model.pkl')
    print("\nProduction model saved as model.pkl")

if __name__ == "__main__":
    train_model()
