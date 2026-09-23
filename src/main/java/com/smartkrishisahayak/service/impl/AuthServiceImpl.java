package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.request.LoginRequest;
import com.smartkrishisahayak.dto.request.RegisterRequest;
import com.smartkrishisahayak.dto.response.AuthResponse;
import com.smartkrishisahayak.dto.response.UserProfileResponse;
import com.smartkrishisahayak.entity.FarmerProfile;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.exception.BadRequestException;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.security.JwtService;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.smartkrishisahayak.service.UserActivityService userActivityService;

    @Autowired
    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            com.smartkrishisahayak.service.UserActivityService userActivityService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userActivityService = userActivityService;
    }

    @Override
    @Transactional
    public AuthResponse registerFarmer(RegisterRequest registerRequest) {
        // Validate duplicate mobile number
        if (userRepository.existsByMobileNumber(registerRequest.getMobileNumber())) {
            throw new BadRequestException("Mobile number is already registered. Please login.");
        }

        // Validate duplicate email if provided
        if (registerRequest.getEmail() != null && !registerRequest.getEmail().trim().isEmpty()) {
            if (userRepository.existsByEmail(registerRequest.getEmail().trim())) {
                throw new BadRequestException("Email address is already registered.");
            }
        }

        // Create User entity with hashed password & default ROLE_FARMER
        User user = new User(
                registerRequest.getFullName(),
                registerRequest.getMobileNumber(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getPreferredLanguage(),
                UserRole.ROLE_FARMER
        );

        if (registerRequest.getEmail() != null && !registerRequest.getEmail().trim().isEmpty()) {
            user.setEmail(registerRequest.getEmail().trim());
        }

        // Create associated FarmerProfile
        FarmerProfile profile = new FarmerProfile(
                user,
                registerRequest.getState() != null ? registerRequest.getState() : "Maharashtra",
                registerRequest.getDistrict(),
                registerRequest.getTaluka(),
                registerRequest.getVillage(),
                registerRequest.getLandSizeAcres(),
                registerRequest.getPrimaryCrops(),
                registerRequest.getSoilType()
        );
        user.setFarmerProfile(profile);

        User savedUser = userRepository.save(user);

        // Generate JWT Token
        String token = jwtService.generateTokenFromUserId(
                savedUser.getId(),
                savedUser.getRole().name(),
                savedUser.getMobileNumber()
        );

        // Record initial login activity for registration
        com.smartkrishisahayak.entity.UserLoginActivity loginActivity = userActivityService.recordLogin(savedUser, null);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getMobileNumber(),
                savedUser.getEmail(),
                savedUser.getPreferredLanguage(),
                savedUser.getRole(),
                loginActivity != null ? loginActivity.getId() : null
        );
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        return login(loginRequest, null);
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest, jakarta.servlet.http.HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getMobileNumberOrEmail(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            // Strict role verification if client requested a specific login portal
            if (loginRequest.getExpectedRole() != null && !loginRequest.getExpectedRole().trim().isEmpty()) {
                String expected = loginRequest.getExpectedRole().trim().toUpperCase();
                if (!expected.startsWith("ROLE_")) {
                    expected = "ROLE_" + expected;
                }

                if ("ROLE_ADMIN".equals(expected) && userPrincipal.getRole() != UserRole.ROLE_ADMIN) {
                    throw new BadRequestException("Access denied: This account is registered as a Farmer. Please select Farmer Login.");
                } else if ("ROLE_FARMER".equals(expected) && userPrincipal.getRole() != UserRole.ROLE_FARMER) {
                    throw new BadRequestException("Access denied: This account is registered as an Administrator. Please select Admin Login.");
                }
            }

            String token = jwtService.generateToken(authentication);

            User user = userRepository.findById(userPrincipal.getId()).orElse(null);
            com.smartkrishisahayak.entity.UserLoginActivity loginActivity = null;
            if (user != null) {
                loginActivity = userActivityService.recordLogin(user, request);
            }

            return new AuthResponse(
                    token,
                    userPrincipal.getId(),
                    userPrincipal.getFullName(),
                    userPrincipal.getMobileNumber(),
                    userPrincipal.getEmail(),
                    userPrincipal.getPreferredLanguage(),
                    userPrincipal.getRole(),
                    loginActivity != null ? loginActivity.getId() : null
            );
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid mobile number/email or password.");
        }
    }

    @Override
    public void logout(UserPrincipal userPrincipal) {
        if (userPrincipal != null && userPrincipal.getId() != null) {
            userActivityService.recordLogout(userPrincipal.getId());
        }
        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        UserProfileResponse response = new UserProfileResponse();
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setMobileNumber(user.getMobileNumber());
        response.setEmail(user.getEmail());
        response.setPreferredLanguage(user.getPreferredLanguage());
        response.setRole(user.getRole());
        response.setEnabled(user.isEnabled());
        response.setCreatedAt(user.getCreatedAt());

        if (user.getFarmerProfile() != null) {
            FarmerProfile profile = user.getFarmerProfile();
            response.setState(profile.getState());
            response.setDistrict(profile.getDistrict());
            response.setTaluka(profile.getTaluka());
            response.setVillage(profile.getVillage());
            response.setLandSizeAcres(profile.getLandSizeAcres());
            response.setPrimaryCrops(profile.getPrimaryCrops());
            response.setSoilType(profile.getSoilType());
        }

        return response;
    }
}
