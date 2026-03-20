package com.phishingdetector.repository;

import com.phishingdetector.model.User;
import com.phishingdetector.model.UserUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserUsageRepository extends JpaRepository<UserUsage, Long> {
    Optional<UserUsage> findByUser(User user);
    Optional<UserUsage> findByUserAndCurrentMonth(User user, String currentMonth);
    @org.springframework.transaction.annotation.Transactional
    @Modifying
    @Query("DELETE FROM UserUsage u WHERE u.user = :user")
    void deleteByUser(@Param("user") User user);
}
