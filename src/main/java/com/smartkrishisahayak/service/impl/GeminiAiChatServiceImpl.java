package com.smartkrishisahayak.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.exception.AiServiceException;
import com.smartkrishisahayak.service.AiChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

/**
 * Google Gemini API implementation of {@link AiChatService}.
 * <p>
 * Activated when {@code app.ai.provider=gemini}.
 * Sends structured prompt requests to Google Generative Language REST API.
 * Never logs or exposes raw API keys.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "gemini")
public class GeminiAiChatServiceImpl implements AiChatService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiChatServiceImpl.class);

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final int timeoutMs;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiAiChatServiceImpl(
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.model:gemini-1.5-flash}") String model,
            @Value("${app.ai.gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl,
            @Value("${app.ai.gemini.timeout-ms:15000}") int timeoutMs,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null ? model.trim() : "gemini-1.5-flash";
        this.baseUrl = baseUrl != null ? baseUrl.trim() : "https://generativelanguage.googleapis.com";
        this.timeoutMs = timeoutMs > 0 ? timeoutMs : 15000;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(this.timeoutMs);
        factory.setReadTimeout(this.timeoutMs);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Testing constructor allowing injected RestTemplate.
     */
    public GeminiAiChatServiceImpl(String apiKey, String model, String baseUrl, int timeoutMs,
                                  RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null ? model.trim() : "gemini-1.5-flash";
        this.baseUrl = baseUrl != null ? baseUrl.trim() : "https://generativelanguage.googleapis.com";
        this.timeoutMs = timeoutMs > 0 ? timeoutMs : 15000;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    @Override
    public String generateResponse(String userQuery, PreferredLanguage language) {
        return generateResponse(userQuery, language, null);
    }

    @Override
    public String generateResponse(String userQuery, PreferredLanguage language, String verifiedContext) {
        if (apiKey.isEmpty()) {
            log.error("Gemini AI provider is active, but GEMINI_API_KEY is not configured.");
            throw new AiServiceException("Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.");
        }

        if (userQuery == null || userQuery.trim().isEmpty()) {
            throw new AiServiceException("User query must not be empty.");
        }

        PreferredLanguage targetLang = language != null ? language : PreferredLanguage.EN;
        String systemPrompt = buildSystemPrompt(targetLang);
        String promptWithContext = buildUserPromptText(userQuery.trim(), verifiedContext);
        String requestPayload = buildRequestBody(promptWithContext, systemPrompt);

        String endpointUrl = String.format("%s/v1beta/models/%s:generateContent?key=%s", baseUrl, model, apiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestPayload, headers);

        try {
            log.info("Sending request to Gemini API [model={}, language={}, queryLength={}, hasGroundedContext={}]",
                    model, targetLang, userQuery.length(), (verifiedContext != null && !verifiedContext.trim().isEmpty()));

            ResponseEntity<String> response = restTemplate.exchange(
                    endpointUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return extractTextFromResponse(response.getBody());
            } else {
                log.error("Gemini API returned unexpected status code: {}", response.getStatusCode());
                throw new AiServiceException("AI provider returned unexpected status: " + response.getStatusCode());
            }

        } catch (HttpStatusCodeException ex) {
            String sanitizedError = sanitizeErrorMessage(ex.getResponseBodyAsString(), ex.getStatusCode());
            log.error("Gemini API HTTP error [status={}]: {}", ex.getStatusCode(), sanitizedError);
            throw new AiServiceException("AI service error (" + ex.getStatusCode().value() + "): " + sanitizedError);

        } catch (ResourceAccessException ex) {
            log.error("Gemini API network/timeout error: {}", ex.getMessage());
            throw new AiServiceException("AI service request timed out or network connection failed. Please try again.");

        } catch (AiServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error invoking Gemini API: {}", ex.getMessage());
            throw new AiServiceException("Failed to generate AI response: " + ex.getMessage());
        }
    }

    private String buildUserPromptText(String userQuery, String verifiedContext) {
        if (verifiedContext != null && !verifiedContext.trim().isEmpty()) {
            return verifiedContext.trim() + "\n\nFarmer Query:\n" + userQuery;
        }
        return userQuery;
    }

    private String buildSystemPrompt(PreferredLanguage language) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are 'Smart Krishi Sahayak', an AI agricultural information-support tool helping Indian farmers with crop queries.\n");
        sb.append("Core Instructions:\n");
        sb.append("1. Role: You are an information-support tool, not an authoritative replacement for in-person agronomists or certified agriculture officers.\n");
        sb.append("2. Primary Source of Truth: Prefer the provided [VERIFIED AGRICULTURE KNOWLEDGE BASE CONTEXT] for all factual crop, fertilizer, and pest guidance.\n");
        sb.append("3. Factual Accuracy: Do not contradict verified context. Do not invent facts or present uncertain advice as guaranteed.\n");
        sb.append("4. Chemical Safety & Dosages: Do not provide unsupported exact chemical dosages or multi-chemical tank mixing instructions unless explicitly verified in the provided context.\n");
        sb.append("5. No-Knowledge / Unknown Queries: If verified context is absent or insufficient, explicitly state that the verified agricultural knowledge base does not contain specific records for this request. Offer only safe general agricultural principles if applicable, and recommend consulting a local Krishi Seva Kendra (कृषी सेवा केंद्र) or agriculture officer.\n");
        sb.append("6. Critical Guidance & Expert Referral: For severe crop damage, toxic chemical applications, or uncertain disease diagnosis, always recommend direct consultation with a qualified local agriculture expert.\n");
        sb.append("7. Tone & Structure: Keep answers concise, farmer-friendly, and well-structured.\n");

        switch (language) {
            case MR:
                sb.append("8. Language Requirement: Respond exclusively in Marathi (मराठी) using natural Devanagari script. If the verified context is in English, translate and explain the facts accurately into Marathi.");
                break;
            case HI:
                sb.append("8. Language Requirement: Respond exclusively in Hindi (हिंदी) using natural Devanagari script. If the verified context is in English, translate and explain the facts accurately into Hindi.");
                break;
            default:
                sb.append("8. Language Requirement: Respond clearly and concisely in English.");
                break;
        }

        return sb.toString();
    }

    private String buildRequestBody(String promptText, String systemPrompt) {
        try {
            ObjectNode rootNode = objectMapper.createObjectNode();

            // contents array
            ArrayNode contentsArray = rootNode.putArray("contents");
            ObjectNode contentObj = contentsArray.addObject();
            contentObj.put("role", "user");
            ArrayNode partsArray = contentObj.putArray("parts");
            partsArray.addObject().put("text", promptText);

            // systemInstruction object
            ObjectNode systemInstructionObj = rootNode.putObject("systemInstruction");
            ArrayNode systemPartsArray = systemInstructionObj.putArray("parts");
            systemPartsArray.addObject().put("text", systemPrompt);

            // generationConfig
            ObjectNode generationConfig = rootNode.putObject("generationConfig");
            generationConfig.put("temperature", 0.3);
            generationConfig.put("maxOutputTokens", 1024);

            return objectMapper.writeValueAsString(rootNode);
        } catch (Exception e) {
            log.error("Failed to construct Gemini request body: {}", e.getMessage());
            throw new AiServiceException("Failed to serialize AI request payload.");
        }
    }

    private String extractTextFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode parts = firstCandidate.path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String generatedText = parts.get(0).path("text").asText();
                    if (generatedText != null && !generatedText.trim().isEmpty()) {
                        return generatedText.trim();
                    }
                }
            }

            log.warn("Gemini API response did not contain candidates/parts text: {}", responseBody);
            throw new AiServiceException("AI provider returned an empty response.");

        } catch (AiServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to parse Gemini API response JSON: {}", ex.getMessage());
            throw new AiServiceException("Failed to parse response from AI provider.");
        }
    }

    private String sanitizeErrorMessage(String responseBody, HttpStatusCode statusCode) {
        if (responseBody == null || responseBody.trim().isEmpty()) {
            return statusCode.toString();
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode errorNode = root.path("error");
            if (!errorNode.isMissingNode()) {
                String message = errorNode.path("message").asText();
                if (message != null && !message.isEmpty()) {
                    // Prevent leaking any potential key patterns
                    return message.replaceAll("key=[^&\\s]+", "key=[PROTECTED]");
                }
            }
        } catch (Exception ignored) {
        }
        return statusCode.toString();
    }

    public String getModel() {
        return model;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }
}