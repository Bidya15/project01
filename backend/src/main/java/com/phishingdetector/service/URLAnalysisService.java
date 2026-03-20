package com.phishingdetector.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class URLAnalysisService {

    public List<String> analyzeHeuristics(String url) {
        List<String> indicators = new ArrayList<>();

        if (url.length() > 75) {
            indicators.add("Unusually long URL");
        }

        if (countOccurrences(url, '.') > 4) {
            indicators.add("Excessive subdomains");
        }

        if (url.contains("@")) {
            indicators.add("Presence of '@' symbol (often used to mask actual domain)");
        }

        if (url.contains("-") && url.chars().filter(ch -> ch == '-').count() > 3) {
            indicators.add("Suspicious number of hyphens");
        }

        Pattern ipPattern = Pattern.compile("^https?://(\\d{1,3}\\.){3}\\d{1,3}.*");
        if (ipPattern.matcher(url).matches()) {
            indicators.add("IP address used instead of domain name");
        }

        String domain = extractDomain(url);

        // Punycode detection (often used for typosquatting)
        if (domain.contains("xn--")) {
            indicators.add("Punycode detected (Potential typosquatting/homograph attack)");
        }

        // Suspicious TLDs Often used in phishing
        List<String> suspiciousTLDs = List.of(".zip", ".top", ".xyz", ".buzz", ".monster", ".work");
        for (String tld : suspiciousTLDs) {
            if (domain.endsWith(tld)) {
                indicators.add("Suspicious top-level domain: " + tld);
            }
        }

        String[] suspiciousKeywords = {"login", "verify", "update", "bank", "secure", "signin", "account", "support", "billing"};
        for (String keyword : suspiciousKeywords) {
            if (url.toLowerCase().contains(keyword)) {
                indicators.add("Contains suspicious keyword: " + keyword);
            }
        }

        return indicators;
    }

    public Map<String, Object> analyzeDomainIntelligence(String url) {
        Map<String, Object> intelligence = new HashMap<>();
        String domain = extractDomain(url);

        intelligence.put("dns_valid", checkDNS(domain));
        intelligence.put("ssl_valid", checkSSL(url));
        
        return intelligence;
    }

    private boolean checkDNS(String domain) {
        try {
            java.net.InetAddress.getByName(domain);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean checkSSL(String url) {
        if (!url.startsWith("https://")) return false;
        try {
            java.net.URL siteURL = new java.net.URL(url);
            javax.net.ssl.HttpsURLConnection conn = (javax.net.ssl.HttpsURLConnection) siteURL.openConnection();
            conn.connect();
            java.security.cert.Certificate[] certs = conn.getServerCertificates();
            return certs.length > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private String extractDomain(String url) {
        try {
            String domain = url.replaceFirst("^(https?://)?(www\\.)?", "");
            int slashIndex = domain.indexOf('/');
            if (slashIndex > 0) {
                domain = domain.substring(0, slashIndex);
            }
            return domain.toLowerCase();
        } catch (Exception e) {
            return url;
        }
    }

    private int countOccurrences(String str, char ch) {
        return (int) str.chars().filter(c -> c == ch).count();
    }
}
