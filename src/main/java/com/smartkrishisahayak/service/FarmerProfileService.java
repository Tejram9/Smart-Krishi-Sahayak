package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.FarmerProfileUpdateRequest;
import com.smartkrishisahayak.dto.response.FarmerProfileResponse;
import com.smartkrishisahayak.security.UserPrincipal;

/**
 * Service interface for managing farmer personal profiles and farm details.
 */
public interface FarmerProfileService {

    /**
     * Retrieve the authenticated farmer's profile.
     *
     * @param principal authenticated user principal
     * @return farmer profile response DTO
     */
    FarmerProfileResponse getProfile(UserPrincipal principal);

    /**
     * Update the authenticated farmer's profile and personal information.
     *
     * @param request update payload containing edited farm/profile attributes
     * @param principal authenticated user principal
     * @return updated farmer profile response DTO
     */
    FarmerProfileResponse updateProfile(FarmerProfileUpdateRequest request, UserPrincipal principal);
}
