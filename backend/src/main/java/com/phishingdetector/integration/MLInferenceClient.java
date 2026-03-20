package com.phishingdetector.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.Map;

@Service
public class MLInferenceClient {

    private final WebClient webClient;

    public MLInferenceClient(WebClient.Builder webClientBuilder, @Value("${phishing.ml.service.url:http://localhost:8000}") String mlServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(mlServiceUrl).build();
    }

    public Mono<Map> getPrediction(String url) {
        return this.webClient.post()
                .uri("/predict")
                .bodyValue(Map.of("url", url))
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorReturn(Map.of("phishing_probability", 0.0, "prediction", "UNKNOWN"));
    }
}
