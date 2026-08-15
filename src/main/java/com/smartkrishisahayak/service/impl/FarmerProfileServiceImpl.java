package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.request.FarmerProfileUpdateRequest;
import com.smartkrishisahayak.dto.response.FarmerProfileResponse;
import com.smartkrishisahayak.entity.FarmerProfile;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.exception.BadRequestException;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.FarmerProfileRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.FarmerProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Implementation of {@link FarmerProfileService}.
 * <p>
 * Enforces strict user ownership by fetching the authenticated farmer via {@link UserPrincipal}.
 */
@Service
public class FarmerProfileServiceImpl implements FarmerProfileService {

    private static final Logger log = LoggerFactory.getLogger(FarmerProfileServiceImpl.class);

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    @Autowired
    public FarmerProfileServiceImpl(UserRepository userRepository,
                                    FarmerProfileRepository farmerProfileRepository) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public FarmerProfileResponse getProfile(UserPrincipal principal) {
        log.debug("Fetching farmer profile for user ID={}", principal.getId());
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        FarmerProfile profile = user.getFarmerProfile();
        return mapToResponse(user, profile);
    }

    @Override
    @Transactional
    public FarmerProfileResponse updateProfile(FarmerProfileUpdateRequest request, UserPrincipal principal) {
        log.info("Updating farmer profile for user ID={}", principal.getId());
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        // 1. Update personal information
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getEmail() != null) {
            String newEmail = request.getEmail().trim().isEmpty() ? null : request.getEmail().trim();
            if (newEmail != null && !newEmail.equalsIgnoreCase(user.getEmail())) {
                Optional<User> existingUser = userRepository.findByEmail(newEmail);
                if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                    throw new BadRequestException("Email address is already in use by another account.");
                }
                user.setEmail(newEmail);
            } else if (newEmail == null) {
                user.setEmail(null);
            }
        }

        if (request.getPreferredLanguage() != null && !request.getPreferredLanguage().trim().isEmpty()) {
            try {
                PreferredLanguage lang = PreferredLanguage.valueOf(request.getPreferredLanguage().trim().toUpperCase());
                user.setPreferredLanguage(lang);
            } catch (IllegalArgumentException ex) {
                log.warn("Invalid language code '{}' provided in profile update", request.getPreferredLanguage());
            }
        }

        // 2. Update farm details
        FarmerProfile profile = user.getFarmerProfile();
        if (profile == null) {
            profile = new FarmerProfile();
            profile.setUser(user);
            profile.setState("Maharashtra");
            profile.setDistrict("Unknown");
            user.setFarmerProfile(profile);
        }

        if (request.getState() != null && !request.getState().trim().isEmpty()) {
            profile.setState(request.getState().trim());
        }

        if (request.getDistrict() != null && !request.getDistrict().trim().isEmpty()) {
            profile.setDistrict(request.getDistrict().trim());
        }

        if (request.getTaluka() != null) {
            profile.setTaluka(request.getTaluka().trim().isEmpty() ? null : request.getTaluka().trim());
        }

        if (request.getVillage() != null) {
            profile.setVillage(request.getVillage().trim().isEmpty() ? null : request.getVillage().trim());
        }

        if (request.getLandSizeAcres() != null) {
            profile.setLandSizeAcres(request.getLandSizeAcres());
        }

        if (request.getPrimaryCrops() != null) {
            profile.setPrimaryCrops(request.getPrimaryCrops().trim().isEmpty() ? null : request.getPrimaryCrops().trim());
        }

        if (request.getSoilType() != null) {
            profile.setSoilType(request.getSoilType().trim().isEmpty() ? null : request.getSoilType().trim());
        }

        User savedUser = userRepository.save(user);
        FarmerProfile savedProfile = savedUser.getFarmerProfile();

        log.info("Successfully updated farmer profile for user ID={}", principal.getId());
        return mapToResponse(savedUser, savedProfile);
    }

    private FarmerProfileResponse mapToResponse(User user, FarmerProfile profile) {
        FarmerProfileResponse response = new FarmerProfileResponse();
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setMobileNumber(user.getMobileNumber());
        response.setEmail(user.getEmail());
        response.setPreferredLanguage(user.getPreferredLanguage());
        response.setRole(user.getRole());

        if (profile != null) {
            response.setState(profile.getState());
            response.setDistrict(profile.getDistrict());
            response.setTaluka(profile.getTaluka());
            response.setVillage(profile.getVillage());
            response.setLandSizeAcres(profile.getLandSizeAcres());
            response.setPrimaryCrops(profile.getPrimaryCrops());
            response.setSoilType(profile.getSoilType());
            response.setUpdatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt() : user.getUpdatedAt());
        } else {
            response.setState("Maharashtra");
            response.setDistrict("");
            response.setUpdatedAt(user.getUpdatedAt());
        }

        return response;
    }
}
