package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.response.UserLoginActivityResponse;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.UserLoginActivity;
import com.smartkrishisahayak.entity.enums.SessionStatus;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.UserLoginActivityRepository;
import com.smartkrishisahayak.service.UserActivityService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserActivityServiceImpl implements UserActivityService {

    private static final Logger log = LoggerFactory.getLogger(UserActivityServiceImpl.class);
    private static final long SESSION_EXPIRY_HOURS = 24L;

    private final UserLoginActivityRepository activityRepository;

    @Autowired
    public UserActivityServiceImpl(UserLoginActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Override
    @Transactional
    public UserLoginActivity recordLogin(User user, HttpServletRequest request) {
        String ipAddress = "127.0.0.1";
        String userAgent = "Unknown Client";

        if (request != null) {
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.trim().isEmpty()) {
                ipAddress = forwardedFor.split(",")[0].trim();
            } else if (request.getRemoteAddr() != null) {
                ipAddress = request.getRemoteAddr();
            }

            String agent = request.getHeader("User-Agent");
            if (agent != null && !agent.trim().isEmpty()) {
                userAgent = agent.length() > 250 ? agent.substring(0, 250) : agent;
            }
        }

        // Close any lingering active sessions for this user older than expiration
        Optional<UserLoginActivity> existingActive = activityRepository
                .findTopByUserIdAndStatusOrderByLoginTimeDesc(user.getId(), SessionStatus.ACTIVE);
        if (existingActive.isPresent()) {
            UserLoginActivity prev = existingActive.get();
            if (prev.getLoginTime().isBefore(LocalDateTime.now().minusHours(SESSION_EXPIRY_HOURS))) {
                prev.setStatus(SessionStatus.EXPIRED);
                activityRepository.save(prev);
            }
        }

        UserLoginActivity activity = new UserLoginActivity(
                user,
                user.getRole(),
                LocalDateTime.now(),
                ipAddress,
                userAgent
        );

        UserLoginActivity saved = activityRepository.save(activity);
        log.info("Recorded login activity ID={} for user ID={} ({}) from IP={}",
                saved.getId(), user.getId(), user.getRole(), ipAddress);
        return saved;
    }

    @Override
    @Transactional
    public void recordLogout(Long userId) {
        if (userId == null) return;

        Optional<UserLoginActivity> activeSessionOpt = activityRepository
                .findTopByUserIdAndStatusOrderByLoginTimeDesc(userId, SessionStatus.ACTIVE);

        if (activeSessionOpt.isPresent()) {
            UserLoginActivity session = activeSessionOpt.get();
            LocalDateTime now = LocalDateTime.now();
            session.setLogoutTime(now);

            long durationSeconds = Duration.between(session.getLoginTime(), now).getSeconds();
            session.setSessionDurationSeconds(Math.max(0, durationSeconds));
            session.setStatus(SessionStatus.LOGGED_OUT);

            activityRepository.save(session);
            log.info("Recorded explicit logout for user ID={}, duration={} seconds", userId, durationSeconds);
        } else {
            log.debug("No active session found to close for user ID={}", userId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserLoginActivityResponse> getFilteredActivities(String filter, String roleStr, String search, int limit) {
        LocalDateTime fromDate = null;
        if (filter != null) {
            String f = filter.trim().toLowerCase();
            LocalDate today = LocalDate.now();
            if ("today".equals(f)) {
                fromDate = today.atStartOfDay();
            } else if ("week".equals(f)) {
                fromDate = today.minusDays(7).atStartOfDay();
            } else if ("month".equals(f)) {
                fromDate = today.minusDays(30).atStartOfDay();
            }
        }

        UserRole role = null;
        if (roleStr != null && !roleStr.trim().isEmpty() && !"ALL".equalsIgnoreCase(roleStr.trim())) {
            try {
                role = UserRole.valueOf(roleStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid role filter
            }
        }

        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        int maxResults = Math.min(Math.max(limit, 10), 500);

        List<UserLoginActivity> activities = activityRepository.findFilteredActivities(
                role,
                null,
                fromDate,
                searchParam,
                PageRequest.of(0, maxResults)
        );

        return activities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UserLoginActivityResponse mapToResponse(UserLoginActivity a) {
        User user = a.getUser();
        String userName = user != null ? user.getFullName() : "Unknown User";
        String userMobile = user != null ? user.getMobileNumber() : "N/A";
        String userEmail = user != null ? user.getEmail() : null;

        // Graceful handling of lingering active sessions past threshold
        SessionStatus displayStatus = a.getStatus();
        Long duration = a.getSessionDurationSeconds();

        if (displayStatus == SessionStatus.ACTIVE &&
                a.getLoginTime().isBefore(LocalDateTime.now().minusHours(SESSION_EXPIRY_HOURS))) {
            displayStatus = SessionStatus.EXPIRED;
        }

        return new UserLoginActivityResponse(
                a.getId(),
                user != null ? user.getId() : null,
                userName,
                userMobile,
                userEmail,
                a.getRole(),
                a.getLoginTime(),
                a.getLogoutTime(),
                duration,
                a.getIpAddress(),
                a.getUserAgent(),
                displayStatus
        );
    }
}
