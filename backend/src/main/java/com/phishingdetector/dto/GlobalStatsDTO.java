package com.phishingdetector.dto;

public class GlobalStatsDTO {
    private String detectionRate;
    private String latency;
    private String threatsBlocked;
    private String dataNodes;
    private long totalAnalysesCount;
    private long threatsDetectedCount;
    private long domainsClearedCount;

    public GlobalStatsDTO() {}

    public GlobalStatsDTO(String detectionRate, String latency, String threatsBlocked, String dataNodes, 
                          long totalAnalysesCount, long threatsDetectedCount, long domainsClearedCount) {
        this.detectionRate = detectionRate;
        this.latency = latency;
        this.threatsBlocked = threatsBlocked;
        this.dataNodes = dataNodes;
        this.totalAnalysesCount = totalAnalysesCount;
        this.threatsDetectedCount = threatsDetectedCount;
        this.domainsClearedCount = domainsClearedCount;
    }

    public static GlobalStatsDTOBuilder builder() {
        return new GlobalStatsDTOBuilder();
    }

    public static class GlobalStatsDTOBuilder {
        private GlobalStatsDTO dto = new GlobalStatsDTO();
        public GlobalStatsDTOBuilder detectionRate(String val) { dto.detectionRate = val; return this; }
        public GlobalStatsDTOBuilder latency(String val) { dto.latency = val; return this; }
        public GlobalStatsDTOBuilder threatsBlocked(String val) { dto.threatsBlocked = val; return this; }
        public GlobalStatsDTOBuilder dataNodes(String val) { dto.dataNodes = val; return this; }
        public GlobalStatsDTO build() { return dto; }
    }

    public String getDetectionRate() { return detectionRate; }
    public void setDetectionRate(String detectionRate) { this.detectionRate = detectionRate; }
    public String getLatency() { return latency; }
    public void setLatency(String latency) { this.latency = latency; }
    public String getThreatsBlocked() { return threatsBlocked; }
    public void setThreatsBlocked(String threatsBlocked) { this.threatsBlocked = threatsBlocked; }
    public String getDataNodes() { return dataNodes; }
    public void setDataNodes(String dataNodes) { this.dataNodes = dataNodes; }
    public long getTotalAnalysesCount() { return totalAnalysesCount; }
    public void setTotalAnalysesCount(long totalAnalysesCount) { this.totalAnalysesCount = totalAnalysesCount; }
    public long getThreatsDetectedCount() { return threatsDetectedCount; }
    public void setThreatsDetectedCount(long threatsDetectedCount) { this.threatsDetectedCount = threatsDetectedCount; }
    public long getDomainsClearedCount() { return domainsClearedCount; }
    public void setDomainsClearedCount(long domainsClearedCount) { this.domainsClearedCount = domainsClearedCount; }
}
