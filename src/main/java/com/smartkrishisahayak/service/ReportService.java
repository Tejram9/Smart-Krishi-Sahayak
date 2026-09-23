package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.AdminReportUpdateRequest;
import com.smartkrishisahayak.dto.request.UserReportCreateRequest;
import com.smartkrishisahayak.dto.response.UserReportResponse;

import java.util.List;

public interface ReportService {

    UserReportResponse createReport(Long userId, UserReportCreateRequest request);

    List<UserReportResponse> getMyReports(Long userId);

    UserReportResponse getReportById(Long reportId, Long currentUserId, boolean isAdmin);

    List<UserReportResponse> getAllReports(String statusStr, String categoryStr, String search, int limit);

    UserReportResponse updateReportStatus(Long reportId, AdminReportUpdateRequest request);
}
