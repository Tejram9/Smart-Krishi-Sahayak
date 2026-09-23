package com.smartkrishisahayak.repository;

import com.smartkrishisahayak.entity.UserLoginActivity;
import com.smartkrishisahayak.entity.enums.SessionStatus;
import com.smartkrishisahayak.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserLoginActivityRepository extends JpaRepository<UserLoginActivity, Long> {

    Optional<UserLoginActivity> findTopByUserIdAndStatusOrderByLoginTimeDesc(Long userId, SessionStatus status);

    List<UserLoginActivity> findByUserIdOrderByLoginTimeDesc(Long userId);

    @Query("SELECT a FROM UserLoginActivity a WHERE " +
           "(:role IS NULL OR a.role = :role) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:fromDate IS NULL OR a.loginTime >= :fromDate) AND " +
           "(:search IS NULL OR LOWER(a.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR a.user.mobileNumber LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY a.loginTime DESC")
    List<UserLoginActivity> findFilteredActivities(
            @Param("role") UserRole role,
            @Param("status") SessionStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("search") String search,
            Pageable pageable
    );

    long countByLoginTimeAfter(LocalDateTime timestamp);

    long countByStatus(SessionStatus status);

    @Query("SELECT COUNT(a) FROM UserLoginActivity a WHERE a.loginTime >= :start AND a.loginTime < :end")
    long countBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
