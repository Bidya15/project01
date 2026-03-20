package com.phishingdetector.repository;

import com.phishingdetector.model.ScanResult;
import com.phishingdetector.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ScanResultRepository extends JpaRepository<ScanResult, Long> {
    List<ScanResult> findByUserOrderByCreatedAtDesc(User user);
    long countByClassification(String classification);
    @org.springframework.transaction.annotation.Transactional
    @Modifying
    @Query("DELETE FROM ScanResult s WHERE s.user = :user")
    void deleteByUser(@Param("user") User user);
}
