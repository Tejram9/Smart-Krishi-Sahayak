package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.request.FarmerProfileUpdateRequest;
import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.FarmerProfileResponse;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.FarmerProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing farmer personal profile and farm details.
 * <p>
 * All endpoints require a valid JWT Bearer token.
 * The authenticated user is always resolved from the Spring Security context
 * via {@link AuthenticationPrincipal} - no userId is ever accepted from client input.
 */
@RestController
@RequestMapping("/api/v1/farmer/profile")
public class FarmerProfileController {

    private final FarmerProfileService farmerProfileService;

    @Autowired
    public FarmerProfileController(FarmerProfileService farmerProfileService) {
        this.farmerProfileService = farmerProfileService;
    }

    /**
     * Retrieve the authenticated farmer's profile.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        FarmerProfileResponse response = farmerProfileService.getProfile(principal);
        return ResponseEntity.ok(ApiResponse.success("Farmer profile fetched successfully.", response));
    }

    /**
     * Update the authenticated farmer's personal profile and farm details.
     */
    @PutMapping
    public ResponseEntity<ApiResponse<FarmerProfileResponse>> updateProfile(
            @Valid @RequestBody FarmerProfileUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        FarmerProfileResponse response = farmerProfileService.updateProfile(request, principal);
        return ResponseEntity.ok(ApiResponse.success("Farmer profile updated successfully.", response));
    }
}
