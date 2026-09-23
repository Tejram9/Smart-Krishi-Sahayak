package com.smartkrishisahayak.repository;

import com.smartkrishisahayak.entity.UserReport;
import com.smartkrishisahayak.entity.enums.ReportCategory;
import com.smartkrishisahayak.entity.enums.ReportStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, Long> {

    List<UserReport> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT r FROM UserReport r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:category IS NULL OR r.category = :category) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR r.user.mobileNumber LIKE CONCAT('%', :search, '%')) " +
           "ORDER BY r.createdAt DESC")
    List<UserReport> findFilteredReports(
            @Param("status") ReportStatus status,
            @Param("category") ReportCategory category,
            @Param("search") String search,
            Pageable pageable
    );

    long countByStatus(ReportStatus status);

    long countByCategory(ReportCategory category);
}
