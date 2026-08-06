package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.LoginRequest;
import com.smartkrishisahayak.dto.request.RegisterRequest;
import com.smartkrishisahayak.dto.response.AuthResponse;
import com.smartkrishisahayak.dto.response.UserProfileResponse;
import com.smartkrishisahayak.security.UserPrincipal;

public interface AuthService {
    AuthResponse registerFarmer(RegisterRequest registerRequest);
    AuthResponse login(LoginRequest loginRequest);
    UserProfileResponse getCurrentUserProfile(UserPrincipal userPrincipal);
}
