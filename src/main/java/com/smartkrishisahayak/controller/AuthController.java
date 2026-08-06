package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.request.LoginRequest;
import com.smartkrishisahayak.dto.request.RegisterRequest;
import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.AuthResponse;
import com.smartkrishisahayak.dto.response.UserProfileResponse;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerFarmer(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse authResponse = authService.registerFarmer(registerRequest);
        return new ResponseEntity<>(ApiResponse.success("Farmer account registered successfully.", authResponse), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful.", authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileResponse userProfileResponse = authService.getCurrentUserProfile(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully.", userProfileResponse));
    }
}
