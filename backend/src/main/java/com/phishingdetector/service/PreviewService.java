package com.phishingdetector.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PreviewService {
    private static final Logger log = LoggerFactory.getLogger(PreviewService.class);
    private final WebClient webClient;

    public PreviewService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<Map<String, Object>> getSafePreview(String url) {
        log.info("Requesting isolated preview for: {}", url);
        
        return webClient.get()
                .uri(url)
                .headers(headers -> {
                    headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Sentinel-Sandbox/1.0");
                })
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(5))
                .map(html -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("url", url);
                    result.put("html", sanitizeHtml(html));
                    result.put("meta", extractMetaTags(html));
                    return result;
                })
                .onErrorResume(e -> {
                    log.error("Failed to fetch preview for {}: {}", url, e.getMessage());
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", "Sandbox isolation failed to reach target node: " + e.getMessage());
                    return Mono.just(error);
                });
    }

    private String sanitizeHtml(String html) {
        if (html == null) return "";
        
        // Remove scripts, iframes, styles (to avoid malicious CSS), and objects
        String sanitized = html.replaceAll("(?i)<script.*?>.*?</script>", "<!-- BLOCKED SCRIPT -->");
        sanitized = sanitized.replaceAll("(?i)<iframe.*?>.*?</iframe>", "<!-- BLOCKED IFRAME -->");
        sanitized = sanitized.replaceAll("(?i)<style.*?>.*?</style>", "<!-- BLOCKED STYLE -->");
        sanitized = sanitized.replaceAll("(?i)<embed.*?>", "<!-- BLOCKED EMBED -->");
        sanitized = sanitized.replaceAll("(?i)<object.*?>.*?</object>", "<!-- BLOCKED OBJECT -->");
        
        // Remove event handlers like onclick, onload, etc.
        sanitized = sanitized.replaceAll("(?i)\\son\\w+=\".*?\"", "");
        sanitized = sanitized.replaceAll("(?i)\\son\\w+='.*?'", "");
        
        // Keep only body content for the preview
        Pattern bodyPattern = Pattern.compile("(?i)<body.*?>(.*?)</body>", Pattern.DOTALL);
        Matcher matcher = bodyPattern.matcher(sanitized);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        
        // If no body tag, return first 2000 chars of sanitized content
        return sanitized.length() > 2000 ? sanitized.substring(0, 2000) + "..." : sanitized;
    }

    private Map<String, String> extractMetaTags(String html) {
        Map<String, String> meta = new HashMap<>();
        if (html == null) return meta;
        
        Pattern titlePattern = Pattern.compile("(?i)<title>(.*?)</title>");
        Matcher m = titlePattern.matcher(html);
        if (m.find()) meta.put("title", m.group(1));
        
        Pattern metaPattern = Pattern.compile("(?i)<meta\\s+name=\"(description|keywords)\"\\s+content=\"(.*?)\"");
        m = metaPattern.matcher(html);
        while (m.find()) {
            meta.put(m.group(1).toLowerCase(), m.group(2));
        }
        
        return meta;
    }
}
