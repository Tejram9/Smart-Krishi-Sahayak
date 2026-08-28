package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.request.CropCreateUpdateRequest;
import com.smartkrishisahayak.dto.request.GuidanceCreateUpdateRequest;
import com.smartkrishisahayak.dto.response.*;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for administrative management operations.
 * Requires ROLE_ADMIN authority for all operations.
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Backward-compatibility test endpoint.
     */
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> testAdminAccess() {
        return ResponseEntity.ok(ApiResponse.success("Admin authorization successful.", "ADMIN_ACCESS_GRANTED"));
    }

    /**
     * List all registered farmers/users with optional search filter.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers(
            @RequestParam(required = false) String search) {
        List<AdminUserResponse> users = adminService.getAllUsers(search);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully.", users));
    }

    /**
     * Toggle a user's enabled active status.
     */
    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> toggleUserStatus(
            @PathVariable Long userId) {
        AdminUserResponse response = adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully.", response));
    }

    /**
     * Create a new crop entry in the catalog.
     */
    @PostMapping("/crops")
    public ResponseEntity<ApiResponse<CropDetailResponse>> createCrop(
            @Valid @RequestBody CropCreateUpdateRequest request) {
        CropDetailResponse crop = adminService.createCrop(request);
        return new ResponseEntity<>(
                ApiResponse.success("Crop created successfully.", crop),
                HttpStatus.CREATED
        );
    }

    /**
     * Update an existing crop in the catalog.
     */
    @PutMapping("/crops/{id}")
    public ResponseEntity<ApiResponse<CropDetailResponse>> updateCrop(
            @PathVariable Long id,
            @Valid @RequestBody CropCreateUpdateRequest request) {
        CropDetailResponse crop = adminService.updateCrop(id, request);
        return ResponseEntity.ok(ApiResponse.success("Crop updated successfully.", crop));
    }

    /**
     * Delete a crop and its associated verified guidance entries.
     */
    @DeleteMapping("/crops/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCrop(
            @PathVariable Long id) {
        adminService.deleteCrop(id);
        return ResponseEntity.ok(ApiResponse.success("Crop deleted successfully.", null));
    }

    /**
     * Add verified agricultural guidance advisory to a crop.
     */
    @PostMapping("/crops/{cropId}/guidance")
    public ResponseEntity<ApiResponse<AgricultureContentResponse>> createGuidance(
            @PathVariable Long cropId,
            @Valid @RequestBody GuidanceCreateUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long adminId = principal != null ? principal.getId() : null;
        AgricultureContentResponse content = adminService.createGuidance(cropId, request, adminId);
        return new ResponseEntity<>(
                ApiResponse.success("Guidance advisory added successfully.", content),
                HttpStatus.CREATED
        );
    }

    /**
     * Update an existing verified guidance advisory.
     */
    @PutMapping("/guidance/{guidanceId}")
    public ResponseEntity<ApiResponse<AgricultureContentResponse>> updateGuidance(
            @PathVariable Long guidanceId,
            @Valid @RequestBody GuidanceCreateUpdateRequest request) {
        AgricultureContentResponse content = adminService.updateGuidance(guidanceId, request);
        return ResponseEntity.ok(ApiResponse.success("Guidance advisory updated successfully.", content));
    }

    /**
     * Delete a verified guidance advisory.
     */
    @DeleteMapping("/guidance/{guidanceId}")
    public ResponseEntity<ApiResponse<Void>> deleteGuidance(
            @PathVariable Long guidanceId) {
        adminService.deleteGuidance(guidanceId);
        return ResponseEntity.ok(ApiResponse.success("Guidance advisory deleted successfully.", null));
    }

    /**
     * Audit log of all farmer chatbot queries.
     */
    @GetMapping("/chat-queries")
    public ResponseEntity<ApiResponse<List<AdminChatQueryResponse>>> getChatQueries(
            @RequestParam(defaultValue = "50") int limit) {
        List<AdminChatQueryResponse> queries = adminService.getChatQueries(limit);
        return ResponseEntity.ok(ApiResponse.success("Chat query audit logs retrieved successfully.", queries));
    }

    /**
     * System analytics stats summary for Chart.js dashboards.
     */
    @GetMapping({"/analytics/stats", "/dashboard-stats", "/stats"})
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getAnalyticsStats() {
        AdminStatsResponse stats = adminService.getSystemStats();
        return ResponseEntity.ok(ApiResponse.success("Analytics statistics retrieved successfully.", stats));
    }
}
