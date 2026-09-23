package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.request.AdminReportUpdateRequest;
import com.smartkrishisahayak.dto.request.UserReportCreateRequest;
import com.smartkrishisahayak.dto.response.UserReportResponse;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.UserReport;
import com.smartkrishisahayak.entity.enums.ReportCategory;
import com.smartkrishisahayak.entity.enums.ReportStatus;
import com.smartkrishisahayak.exception.BadRequestException;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.UserReportRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.service.ReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportServiceImpl.class);

    private final UserReportRepository reportRepository;
    private final UserRepository userRepository;

    @Autowired
    public ReportServiceImpl(UserReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserReportResponse createReport(Long userId, UserReportCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserReport report = new UserReport(
                user,
                request.getCategory(),
                request.getTitle().trim(),
                request.getDescription().trim()
        );

        UserReport saved = reportRepository.save(report);
        log.info("Created user report ID={} for user ID={} under category={}",
                saved.getId(), userId, request.getCategory());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserReportResponse> getMyReports(Long userId) {
        List<UserReport> reports = reportRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return reports.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserReportResponse getReportById(Long reportId, Long currentUserId, boolean isAdmin) {
        UserReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));

        if (!isAdmin && (currentUserId == null || !report.getUser().getId().equals(currentUserId))) {
            throw new BadRequestException("Access denied: You do not have permission to view this report.");
        }

        return mapToResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserReportResponse> getAllReports(String statusStr, String categoryStr, String search, int limit) {
        ReportStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusStr.trim())) {
            try {
                status = ReportStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status filter
            }
        }

        ReportCategory category = null;
        if (categoryStr != null && !categoryStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(categoryStr.trim())) {
            try {
                category = ReportCategory.valueOf(categoryStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid category filter
            }
        }

        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        int maxResults = Math.min(Math.max(limit, 10), 500);

        List<UserReport> reports = reportRepository.findFilteredReports(
                status,
                category,
                searchParam,
                PageRequest.of(0, maxResults)
        );

        return reports.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserReportResponse updateReportStatus(Long reportId, AdminReportUpdateRequest request) {
        UserReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));

        report.setStatus(request.getStatus());
        if (request.getAdminResponse() != null) {
            report.setAdminResponse(request.getAdminResponse().trim());
        }

        if (request.getStatus() == ReportStatus.RESOLVED) {
            report.setResolvedAt(LocalDateTime.now());
        }

        UserReport saved = reportRepository.save(report);
        log.info("Admin updated report ID={} to status={}", saved.getId(), saved.getStatus());
        return mapToResponse(saved);
    }

    private UserReportResponse mapToResponse(UserReport r) {
        User user = r.getUser();
        return new UserReportResponse(
                r.getId(),
                user != null ? user.getId() : null,
                user != null ? user.getFullName() : "Unknown User",
                user != null ? user.getMobileNumber() : "N/A",
                user != null ? user.getEmail() : null,
                r.getCategory(),
                r.getTitle(),
                r.getDescription(),
                r.getStatus(),
                r.getAdminResponse(),
                r.getResolvedAt(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
