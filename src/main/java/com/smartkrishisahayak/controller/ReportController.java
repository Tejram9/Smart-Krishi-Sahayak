package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.request.UserReportCreateRequest;
import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.UserReportResponse;
import com.smartkrishisahayak.entity.enums.ReportCategory;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserReportResponse>> createReport(
            @Valid @RequestBody UserReportCreateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserReportResponse response = reportService.createReport(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Issue report submitted successfully.", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<UserReportResponse>>> getMyReports(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<UserReportResponse> reports = reportService.getMyReports(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Reports fetched successfully.", reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserReportResponse>> getReportById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserReportResponse response = reportService.getReportById(id, principal.getId(), false);
        return ResponseEntity.ok(ApiResponse.success("Report fetched successfully.", response));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getCategories() {
        List<Map<String, String>> categories = Arrays.stream(ReportCategory.values())
                .map(cat -> Map.of("code", cat.name(), "displayName", cat.getDisplayName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully.", categories));
    }
}
