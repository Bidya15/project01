from fastapi import FastAPI, Body
from pydantic import BaseModel
from features import extract_features
import uvicorn
import joblib
import os
import pandas as pd

app = FastAPI(title="Phishing Detection ML Service")

# Load model on startup
MODEL_PATH = "model.pkl"
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")

class ScanRequest(BaseModel):
    url: str

@app.get("/")
async def root():
    return {"message": "Phishing Detection ML Service is running"}

@app.post("/predict")
async def predict(request: ScanRequest):
    url = request.url
    features = extract_features(url)
    
    # Generate explainable indicators
    indicators = []
    if features['url_length'] > 75: indicators.append("Unusually long URL")
    if features['dot_count'] > 3: indicators.append("Excessive subdomains/dots in domain")
    if features['has_at_symbol']: indicators.append("Presence of '@' symbol (masking attempt)")
    if features['has_ip_address']: indicators.append("IP address used instead of domain")
    if features['subdomain_length'] > 15: indicators.append("Suspiciously long subdomain")
    if not features['has_https']: indicators.append("Non-HTTPS connection")
    if features['keyword_count'] > 0:
        keywords = [k.replace('key_', '') for k in features if k.startswith('key_') and features[k] == 1]
        if keywords:
            indicators.append(f"Suspicious keywords detected: {', '.join(keywords)}")

    if model:
        # Explicit feature order as defined in features.py
        feature_order = [
            'url_length', 'dot_count', 'dash_count', 'special_char_count', 
            'has_at_symbol', 'subdomain_count', 'has_ip_address', 
            'domain_length', 'subdomain_length', 'has_https', 'keyword_count',
            'key_login', 'key_secure', 'key_verify', 'key_account', 'key_update', 'key_bank'
        ]
        
        X = pd.DataFrame([features])[feature_order]
        probabilities = model.predict_proba(X)[0]
        phishing_prob = float(probabilities[1])
        prediction = "PHISHING" if phishing_prob > 0.5 else "SAFE"
    else:
        # Heuristic fallback if model not available
        phishing_prob = len(indicators) * 0.15
        prediction = "SUSPICIOUS" if phishing_prob > 0.3 else "SAFE"
    
    # Calculate XAI weights for radar chart visualization
    # We group base features into readable categories
    xai_weights = {
        "Structural": min(90, (features['url_length'] / 20) + (features['dot_count'] * 10) + (features['special_char_count'] * 5)),
        "Domain": 100 if features['has_ip_address'] else min(80, (features['domain_length'] * 2) + (features['subdomain_count'] * 15)),
        "Keywords": min(100, features['keyword_count'] * 25),
        "Security": 0 if features['has_https'] else 85,
        "Entropy": min(95, (features['subdomain_length'] * 4) + (features['dash_count'] * 10))
    }

    return {
        "url": url,
        "phishing_probability": min(phishing_prob, 1.0),
        "risk_score": int(min(phishing_prob * 100, 100)),
        "prediction": prediction,
        "indicators": indicators,
        "features": features,
        "xai_weights": xai_weights
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
