package com.phishingdetector.service;

import com.phishingdetector.model.ReportedDomain;
import com.phishingdetector.model.User;
import com.phishingdetector.repository.ReportedDomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommunityReportService {

    @Autowired
    private ReportedDomainRepository reportedDomainRepository;

    public ReportedDomain reportDomain(String domain, String classification, String notes, User reporter) {
        ReportedDomain report = new ReportedDomain();
        report.setDomain(domain);
        report.setClassification(classification);
        report.setNotes(notes);
        report.setReporter(reporter);
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());
        
        return reportedDomainRepository.save(report);
    }

    public ReportedDomain verifyReport(Long id) {
        ReportedDomain report = reportedDomainRepository.findById(id).orElseThrow();
        report.setStatus("VERIFIED");
        return reportedDomainRepository.save(report);
    }

    public List<ReportedDomain> getRecentReports() {
        return reportedDomainRepository.findAll();
    }

    public void deleteReport(Long id) {
        reportedDomainRepository.deleteById(id);
    }
}
