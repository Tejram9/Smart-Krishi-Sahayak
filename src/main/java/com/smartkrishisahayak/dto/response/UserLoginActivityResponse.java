package com.smartkrishisahayak.dto.response;

import com.smartkrishisahayak.entity.enums.SessionStatus;
import com.smartkrishisahayak.entity.enums.UserRole;

import java.time.LocalDateTime;

public class UserLoginActivityResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userMobile;
    private String userEmail;
    private UserRole role;
    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private Long sessionDurationSeconds;
    private String sessionDurationFormatted;
    private String ipAddress;
    private String userAgent;
    private SessionStatus status;

    public UserLoginActivityResponse() {
    }

    public UserLoginActivityResponse(Long id, Long userId, String userName, String userMobile, String userEmail,
                                     UserRole role, LocalDateTime loginTime, LocalDateTime logoutTime,
                                     Long sessionDurationSeconds, String ipAddress, String userAgent, SessionStatus status) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userMobile = userMobile;
        this.userEmail = userEmail;
        this.role = role;
        this.loginTime = loginTime;
        this.logoutTime = logoutTime;
        this.sessionDurationSeconds = sessionDurationSeconds;
        this.sessionDurationFormatted = formatDuration(sessionDurationSeconds);
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.status = status;
    }

    private static String formatDuration(Long seconds) {
        if (seconds == null || seconds <= 0) {
            return "Active / In Progress";
        }
        long hrs = seconds / 3600;
        long mins = (seconds % 3600) / 60;
        long secs = seconds % 60;
        if (hrs > 0) {
            return String.format("%dh %dm %ds", hrs, mins, secs);
        } else if (mins > 0) {
            return String.format("%dm %ds", mins, secs);
        } else {
            return String.format("%ds", secs);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserMobile() {
        return userMobile;
    }

    public void setUserMobile(String userMobile) {
        this.userMobile = userMobile;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(LocalDateTime loginTime) {
        this.loginTime = loginTime;
    }

    public LocalDateTime getLogoutTime() {
        return logoutTime;
    }

    public void setLogoutTime(LocalDateTime logoutTime) {
        this.logoutTime = logoutTime;
    }

    public Long getSessionDurationSeconds() {
        return sessionDurationSeconds;
    }

    public void setSessionDurationSeconds(Long sessionDurationSeconds) {
        this.sessionDurationSeconds = sessionDurationSeconds;
        this.sessionDurationFormatted = formatDuration(sessionDurationSeconds);
    }

    public String getSessionDurationFormatted() {
        return sessionDurationFormatted;
    }

    public void setSessionDurationFormatted(String sessionDurationFormatted) {
        this.sessionDurationFormatted = sessionDurationFormatted;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }
}
