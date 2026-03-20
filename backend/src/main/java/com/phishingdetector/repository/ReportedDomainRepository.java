package com.phishingdetector.repository;

import com.phishingdetector.model.ReportedDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ReportedDomainRepository extends JpaRepository<ReportedDomain, Long> {
    Optional<ReportedDomain> findByDomain(String domain);
    long countByStatus(String status);
    @org.springframework.transaction.annotation.Transactional
    @Modifying
    @Query("DELETE FROM ReportedDomain r WHERE r.reporter = :reporter")
    void deleteByReporter(@Param("reporter") com.phishingdetector.model.User reporter);
}
