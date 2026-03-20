import re
from urllib.parse import urlparse
import socket
import tldextract

def extract_features(url: str):
    features = {}
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    
    # URL Structural Features
    features['url_length'] = len(url)
    features['dot_count'] = domain.count('.')
    features['dash_count'] = url.count('-')
    features['special_char_count'] = len(re.findall(r'[?&=_%]', url))
    features['has_at_symbol'] = 1 if '@' in url else 0
    features['subdomain_count'] = len(domain.split('.')) - 2 if len(domain.split('.')) > 2 else 0
    
    # Presence of IP address
    ip_pattern = r'(\d{1,3}\.){3}\d{1,3}'
    features['has_ip_address'] = 1 if re.search(ip_pattern, url) else 0
    
    # Domain Features
    extracted = tldextract.extract(url)
    features['domain_length'] = len(extracted.domain)
    features['subdomain_length'] = len(extracted.subdomain)
    features['has_https'] = 1 if parsed_url.scheme == 'https' else 0
    
    # Keyword Features
    suspicious_keywords = ["login", "secure", "verify", "account", "update", "bank", "signin", "signin", "wp", "content", "cmd"]
    features['keyword_count'] = sum(1 for word in suspicious_keywords if word in url.lower())
    for word in ["login", "secure", "verify", "account", "update", "bank"]:
        features[f'key_{word}'] = 1 if word in url.lower() else 0

    return features
