package com.phishingdetector.dto;

import jakarta.validation.constraints.NotBlank;

public class ReportRequest {
    @NotBlank(message = "Domain is required")
    private String domain;

    private String classification;
    private String notes;

    public ReportRequest() {}

    public ReportRequest(String domain, String classification, String notes) {
        this.domain = domain;
        this.classification = classification;
        this.notes = notes;
    }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
