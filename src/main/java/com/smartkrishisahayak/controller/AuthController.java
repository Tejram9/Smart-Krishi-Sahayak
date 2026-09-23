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

import com.smartkrishisahayak.dto.request.ForgotPasswordRequest;
import com.smartkrishisahayak.dto.request.ResetPasswordRequest;
import com.smartkrishisahayak.dto.request.VerifyResetTokenRequest;
import com.smartkrishisahayak.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @Autowired
    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerFarmer(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse authResponse = authService.registerFarmer(registerRequest);
        return new ResponseEntity<>(ApiResponse.success("Farmer account registered successfully.", authResponse), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        AuthResponse authResponse = authService.login(loginRequest, request);
        return ResponseEntity.ok(ApiResponse.success("Login successful.", authResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        authService.logout(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success("Logout successful. Session closed.", "LOGGED_OUT"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiatePasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists with this mobile number or email, password reset instructions have been generated.",
                "OTP_DISPATCHED"
        ));
    }

    @PostMapping("/verify-reset-token")
    public ResponseEntity<ApiResponse<Boolean>> verifyResetToken(@Valid @RequestBody VerifyResetTokenRequest request) {
        boolean valid = passwordResetService.verifyResetToken(request);
        return ResponseEntity.ok(ApiResponse.success("Reset token is valid.", valid));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. Please login with your new password.", "PASSWORD_RESET_SUCCESS"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileResponse userProfileResponse = authService.getCurrentUserProfile(userPrincipal);
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully.", userProfileResponse));
    }
}
