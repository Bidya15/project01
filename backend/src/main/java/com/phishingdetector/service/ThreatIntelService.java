package com.phishingdetector.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class ThreatIntelService {

    @Value("${google.safebrowsing.key}")
    private String googleApiKey;

    @Value("${virustotal.api.key}")
    private String vtApiKey;

    private final WebClient webClient;

    public ThreatIntelService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Map<String, Boolean> checkExternalAPIs(String url) {
        Map<String, Boolean> results = new HashMap<>();
        
        results.put("googleSafeBrowsing", checkGoogleSafeBrowsing(url));
        results.put("virusTotal", checkVirusTotal(url));
        results.put("phishTank", checkPhishTank(url));
        
        return results;
    }

    private boolean checkPhishTank(String url) {
        try {
            String apiUrl = "https://checkurl.phishtank.com/checkurl/";
            Map response = webClient.post()
                    .uri(apiUrl)
                    .header("User-Agent", "phishtank/phish-ai")
                    .bodyValue("url=" + java.net.URLEncoder.encode(url, "UTF-8") + "&format=json")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.get("results") instanceof Map) {
                Map results = (Map) response.get("results");
                Object inDb = results.get("in_database");
                return Boolean.TRUE.equals(inDb) || "true".equals(String.valueOf(inDb));
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean checkGoogleSafeBrowsing(String url) {
        try {
            if ("YOUR_GOOGLE_SAFE_BROWSING_KEY".equals(googleApiKey) || googleApiKey.contains("YourKey")) return false;
            String apiUrl = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + googleApiKey;
            Map<String, Object> request = Map.of(
                "client", Map.of("clientId", "phish-ai", "clientVersion", "1.0.0"),
                "threatInfo", Map.of(
                    "threatTypes", List.of("MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"),
                    "platformTypes", List.of("ANY_PLATFORM"),
                    "threatEntryTypes", List.of("URL"),
                    "threatEntries", List.of(Map.of("url", url))
                )
            );
            Map response = webClient.post().uri(apiUrl).bodyValue(request).retrieve().bodyToMono(Map.class).block();
            return response != null && response.containsKey("matches");
        } catch (Exception e) {
            return false;
        }
    }

    private boolean checkVirusTotal(String url) {
        try {
            if ("YOUR_VIRUSTOTAL_API_KEY".equals(vtApiKey) || vtApiKey.contains("YourKey")) return false;
            String urlId = java.util.Base64.getEncoder().withoutPadding().encodeToString(url.getBytes())
                    .replace("+", "-").replace("/", "_");
            String apiUrl = "https://www.virustotal.com/api/v3/urls/" + urlId;

            Map response = webClient.get().uri(apiUrl).header("x-apikey", vtApiKey).retrieve().bodyToMono(Map.class).block();

            if (response != null && response.get("data") instanceof Map) {
                Map data = (Map) response.get("data");
                Map attributes = (Map) data.get("attributes");
                if (attributes != null && attributes.get("last_analysis_stats") instanceof Map) {
                    Map lastStats = (Map) attributes.get("last_analysis_stats");
                    Object malicious = lastStats.get("malicious");
                    if (malicious instanceof Number) {
                        return ((Number) malicious).intValue() > 0;
                    }
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
