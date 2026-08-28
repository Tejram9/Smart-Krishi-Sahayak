package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.AiHealthResponse;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.AiChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller providing diagnostics and health verification for AI chat services.
 */
@RestController
@RequestMapping
public class AiDiagnosticController {

    private static final Logger log = LoggerFactory.getLogger(AiDiagnosticController.class);

    private final AiChatService aiChatService;

    @Autowired
    public AiDiagnosticController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    /**
     * AI Health endpoint (publicly available for basic readiness/diagnostic check).
     * Does NOT return or expose any API keys.
     */
    @GetMapping({"/api/v1/ai/health", "/api/ai/health"})
    public ResponseEntity<ApiResponse<AiHealthResponse>> getAiHealth() {
        String provider = aiChatService.getProviderName();
        String model = aiChatService.getModelName();
        boolean apiKeyConfigured = aiChatService.isApiKeyConfigured();
        String status = apiKeyConfigured ? "configured" : "missing_api_key";

        AiHealthResponse response = new AiHealthResponse(provider, model, apiKeyConfigured, status);
        return ResponseEntity.ok(ApiResponse.success("AI service health status retrieved successfully.", response));
    }

    /**
     * Authenticated endpoint to trigger a real test generation with the active AI provider.
     */
    @PostMapping({"/api/v1/ai/test-connection", "/api/ai/test-connection"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> testAiConnection(
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("AI connection test triggered by user ID={}", principal != null ? principal.getId() : "system");

        String result = aiChatService.testConnection();

        Map<String, Object> data = new HashMap<>();
        data.put("provider", aiChatService.getProviderName());
        data.put("model", aiChatService.getModelName());
        data.put("response", result);

        return ResponseEntity.ok(ApiResponse.success("AI connection test successful.", data));
    }
}
