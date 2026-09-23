package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.LoginRequest;
import com.smartkrishisahayak.dto.request.RegisterRequest;
import com.smartkrishisahayak.dto.response.AuthResponse;
import com.smartkrishisahayak.dto.response.UserProfileResponse;
import com.smartkrishisahayak.security.UserPrincipal;

import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {
    AuthResponse registerFarmer(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse login(LoginRequest loginRequest, HttpServletRequest request);
    void logout(UserPrincipal userPrincipal);
    UserProfileResponse getCurrentUserProfile(UserPrincipal userPrincipal);
}
