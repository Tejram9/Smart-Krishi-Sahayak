package com.smartkrishisahayak.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.response.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory sliding-window rate limiter for sensitive authentication endpoints.
 * Protects login, registration, and password-reset endpoints against brute force and credential stuffing.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);
    private static final long WINDOW_MS = 60_000L; // 1 minute window

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private ObjectMapper objectMapper;

    private ObjectMapper getObjectMapper() {
        if (this.objectMapper != null) {
            return this.objectMapper;
        }
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        return mapper;
    }

    private final Map<String, RequestTracker> trackerMap = new ConcurrentHashMap<>();

    @Value("${app.security.rate-limiting.enabled:true}")
    private boolean rateLimitingEnabled;

    @Value("${app.security.rate-limiting.login-limit:15}")
    private int loginLimit;

    @Value("${app.security.rate-limiting.register-limit:10}")
    private int registerLimit;

    @Value("${app.security.rate-limiting.password-reset-limit:10}")
    private int passwordResetLimit;

    private static class RequestTracker {
        long windowStart;
        final AtomicInteger count = new AtomicInteger(0);

        RequestTracker(long windowStart) {
            this.windowStart = windowStart;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!rateLimitingEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        if (!"POST".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        int maxAllowed = resolveLimitForPath(path);
        if (maxAllowed <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String category = resolveCategory(path);
        String trackerKey = clientIp + ":" + category;

        long now = System.currentTimeMillis();

        RequestTracker tracker = trackerMap.compute(trackerKey, (key, existing) -> {
            if (existing == null || (now - existing.windowStart) > WINDOW_MS) {
                RequestTracker fresh = new RequestTracker(now);
                fresh.count.set(1);
                return fresh;
            }
            existing.count.incrementAndGet();
            return existing;
        });

        // Trigger light eviction if tracker map grows large
        if (trackerMap.size() > 5000) {
            evictExpiredTrackers(now);
        }

        if (tracker.count.get() > maxAllowed) {
            long remainingSeconds = Math.max(1, (WINDOW_MS - (now - tracker.windowStart)) / 1000);
            log.warn("Rate limit exceeded for client IP [{}] on endpoint [{}] ({}/{} attempts). Retry after {}s",
                    clientIp, path, tracker.count.get(), maxAllowed, remainingSeconds);

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(remainingSeconds));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ApiResponse<Void> rateLimitResponse = ApiResponse.error(
                    "Too many requests. Rate limit exceeded. Retry allowed in " + remainingSeconds + " seconds."
            );

            getObjectMapper().writeValue(response.getOutputStream(), rateLimitResponse);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private int resolveLimitForPath(String path) {
        if (path.startsWith("/api/v1/auth/login")) {
            return loginLimit;
        }
        if (path.startsWith("/api/v1/auth/register")) {
            return registerLimit;
        }
        if (path.startsWith("/api/v1/auth/forgot-password") ||
            path.startsWith("/api/v1/auth/verify-reset-token") ||
            path.startsWith("/api/v1/auth/reset-password")) {
            return passwordResetLimit;
        }
        return -1;
    }

    private String resolveCategory(String path) {
        if (path.startsWith("/api/v1/auth/login")) return "login";
        if (path.startsWith("/api/v1/auth/register")) return "register";
        if (path.startsWith("/api/v1/auth/forgot-password") ||
            path.startsWith("/api/v1/auth/verify-reset-token") ||
            path.startsWith("/api/v1/auth/reset-password")) return "reset";
        return "other";
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            String[] parts = xForwardedFor.split(",");
            if (parts.length > 0 && !parts[0].trim().isBlank()) {
                return parts[0].trim();
            }
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private void evictExpiredTrackers(long now) {
        trackerMap.entrySet().removeIf(entry -> (now - entry.getValue().windowStart) > WINDOW_MS);
    }
}
