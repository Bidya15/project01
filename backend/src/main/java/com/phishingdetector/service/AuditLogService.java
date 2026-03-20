package com.phishingdetector.service;

import com.phishingdetector.model.AuditLog;
import com.phishingdetector.model.User;
import com.phishingdetector.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(User user, String action, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setAction(action);
        auditLog.setDetails(details);
        auditLog.setIpAddress(ipAddress);
        auditLogRepository.save(auditLog);
    }
}
