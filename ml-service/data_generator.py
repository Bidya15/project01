import pandas as pd
import random
from features import extract_features
import time

def generate_synthetic_data(n_samples=500):
    data = []
    
    # Common labels
    # 0 = Safe, 1 = Phishing
    
    legit_domains = ["google.com", "github.com", "microsoft.com", "apple.com", "amazon.com", "netflix.com", "facebook.com"]
    phish_keywords = ["login", "verify", "secure", "update", "account", "billing", "signin"]
    tlds = [".com", ".org", ".net", ".io", ".zip", ".top", ".xyz"]
    
    print(f"Generating {n_samples} synthetic samples...")
    
    for i in range(n_samples):
        is_phishing = random.choice([0, 1])
        
        if is_phishing:
            # Generate suspicious URL
            keyword = random.choice(phish_keywords)
            tld = random.choice([".zip", ".top", ".xyz", ".buzz"])
            domain = f"{keyword}-update-{random.randint(100, 999)}{tld}"
            url = f"http://{domain}/login.php?id={random.randint(1000, 9999)}"
        else:
            # Generate legitimate-looking URL
            base = random.choice(legit_domains)
            url = f"https://{base}/home"
            
        
        features = {
            'url_length': len(url),
            'dot_count': url.count('.'),
            'has_hyphen': 1 if '-' in url else 0,
            'has_at_symbol': 1 if '@' in url else 0,
            'keyword_count': sum(1 for k in phish_keywords if k in url.lower()),
            'digit_count': sum(1 for c in url if c.isdigit()),
            'redirect_count': random.randint(2, 5) if is_phishing else random.randint(0, 1),
            'ssl_valid_days': random.randint(-1, 30) if is_phishing else random.randint(100, 365),
            'has_trusted_issuer': 0 if is_phishing and random.random() > 0.3 else 1,
            'domain_age_days': random.randint(0, 60) if is_phishing else random.randint(365, 5000),
            'has_whois': 1,
            'label': is_phishing
        }
        data.append(features)
        
    df = pd.DataFrame(data)
    df.to_csv("phishing_dataset.csv", index=False)
    print("Dataset saved to phishing_dataset.csv")

if __name__ == "__main__":
    generate_synthetic_data()
