import pandas as pd
import numpy as np
import concurrent.futures
from features import extract_features
import os
import random

def process_url(url, label):
    try:
        # Prepend http:// if missing for consistent feature extraction
        full_url = url if url.startswith(('http://', 'https://')) else f"http://{url}"
        features = extract_features(full_url)
        features['label'] = label
        return features
    except Exception as e:
        print(f"Error processing {url}: {e}")
        return None

def prepare_full_dataset(sample_size_per_class=150):
    data_dir = "data"
    phishing_path = os.path.join(data_dir, "phishing_site_urls.csv")
    tranco_path = os.path.join(data_dir, "tranco_L7684.csv")
    
    urls_to_process = []
    
    # 1. Load Phishing URLs (bad)
    if os.path.exists(phishing_path):
        print("Loading phishing samples...")
        df_phish = pd.read_csv(phishing_path)
        bad_urls = df_phish[df_phish['Label'] == 'bad']['URL'].tolist()
        sampled_bad = random.sample(bad_urls, min(len(bad_urls), sample_size_per_class))
        for url in sampled_bad:
            urls_to_process.append((url, 1))
            
    # 2. Load Legitimate URLs (good)
    if os.path.exists(tranco_path):
        print("Loading legitimate samples...")
        # Tranco often has no header or 1,google.com format
        try:
            df_legit = pd.read_csv(tranco_path, header=None)
            good_urls = df_legit[1].tolist() # Assuming 2nd column
        except:
            # Fallback for simple list
            with open(tranco_path, 'r') as f:
                good_urls = [line.strip().split(',')[-1] for line in f if line.strip()]
        
        sampled_good = random.sample(good_urls, min(len(good_urls), sample_size_per_class))
        for url in sampled_good:
            urls_to_process.append((url, 0))

    print(f"Starting multi-threaded feature extraction for {len(urls_to_process)} URLs...")
    
    processed_data = []
    # Use ThreadPoolExecutor to handle I/O bound tasks (WHOIS, DNS, SSL)
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(process_url, url, label): url for url, label in urls_to_process}
        
        count = 0
        for future in concurrent.futures.as_completed(future_to_url):
            res = future.result()
            if res:
                processed_data.append(res)
            count += 1
            if count % 20 == 0:
                print(f"Processed {count}/{len(urls_to_process)}...")

    df_final = pd.DataFrame(processed_data)
    df_final.to_csv("processed_real_dataset.csv", index=False)
    print(f"Final dataset saved to processed_real_dataset.csv with {len(df_final)} samples.")

if __name__ == "__main__":
    # Small sample for quick training in this environment
    # Increase sample_size_per_class for production training
    prepare_full_dataset(sample_size_per_class=100)
