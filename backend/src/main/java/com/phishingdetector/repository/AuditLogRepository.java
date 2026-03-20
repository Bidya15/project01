package com.phishingdetector.repository;

import com.phishingdetector.model.AuditLog;
import com.phishingdetector.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserOrderByCreatedAtDesc(User user);
    @org.springframework.transaction.annotation.Transactional
    @Modifying
    @Query("DELETE FROM AuditLog a WHERE a.user = :user")
    void deleteByUser(@Param("user") User user);
    List<AuditLog> findAllByOrderByCreatedAtDesc();
}
