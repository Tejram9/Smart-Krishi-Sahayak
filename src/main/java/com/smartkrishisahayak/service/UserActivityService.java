package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.UserLoginActivityResponse;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.UserLoginActivity;
import com.smartkrishisahayak.entity.enums.UserRole;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface UserActivityService {

    UserLoginActivity recordLogin(User user, HttpServletRequest request);

    void recordLogout(Long userId);

    List<UserLoginActivityResponse> getFilteredActivities(String filter, String roleStr, String search, int limit);
}
