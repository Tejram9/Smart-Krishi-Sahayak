package com.smartkrishisahayak.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.exception.AiServiceException;
import com.smartkrishisahayak.service.AiChatService;
import jakarta.annotation.PostConstruct;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Google Gemini API implementation of {@link AiChatService}.
 * <p>
 * Activated when {@code app.ai.provider=gemini}.
 * Sends structured prompt requests to Google Generative Language REST API.
 * Uses official {@code x-goog-api-key} request header authentication.
 * Never logs or exposes raw API keys.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "gemini", matchIfMissing = true)
public class GeminiAiChatServiceImpl implements AiChatService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiChatServiceImpl.class);
    public static final String DEFAULT_MODEL = "gemini-2.5-flash";
    public static final String DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final int timeoutMs;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiAiChatServiceImpl(
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.model:gemini-2.5-flash}") String model,
            @Value("${app.ai.gemini.base-url:https://generativelanguage.googleapis.com}") String baseUrl,
            @Value("${app.ai.gemini.timeout-ms:30000}") String timeoutMsStr,
            ObjectMapper objectMapper) {
        this(apiKey, model, baseUrl, parseTimeout(timeoutMsStr, 30000), objectMapper);
    }

    public GeminiAiChatServiceImpl(
            String apiKey,
            String model,
            String baseUrl,
            int timeoutMs,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = normalizeModelName(model);
        this.baseUrl = normalizeBaseUrl(baseUrl);
        this.timeoutMs = timeoutMs > 0 ? timeoutMs : 30000;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(this.timeoutMs);
        factory.setReadTimeout(this.timeoutMs);
        this.restTemplate = new RestTemplate(factory);
    }

    private static int parseTimeout(String value, int defaultVal) {
        if (value == null || value.trim().isEmpty()) {
            return defaultVal;
        }
        try {
            int parsed = Integer.parseInt(value.trim());
            return parsed > 0 ? parsed : defaultVal;
        } catch (NumberFormatException e) {
            log.warn("Invalid Gemini timeout value '{}', falling back to default {} ms", value, defaultVal);
            return defaultVal;
        }
    }

    /**
     * Testing constructor allowing injected RestTemplate.
     */
    public GeminiAiChatServiceImpl(String apiKey, String model, String baseUrl, int timeoutMs,
                                   RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = normalizeModelName(model);
        this.baseUrl = normalizeBaseUrl(baseUrl);
        this.timeoutMs = timeoutMs > 0 ? timeoutMs : 30000;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    @PostConstruct
    public void logStartupDiagnostics() {
        log.info("==================================================");
        log.info("Smart Krishi Sahayak - AI Configuration");
        log.info("AI provider: gemini");
        log.info("Gemini model: {}", model);
        log.info("Gemini base URL: {}", baseUrl);
        log.info("Gemini API key configured: {}", isApiKeyConfigured());
        log.info("Gemini timeout: {} ms", timeoutMs);
        log.info("==================================================");
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public String getModelName() {
        return model;
    }

    @Override
    public boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.isEmpty();
    }

    @Override
    public String generateResponse(String userQuery, PreferredLanguage language) {
        return generateResponse(userQuery, language, null);
    }

    @Override
    public String generateResponse(String userQuery, PreferredLanguage language, String verifiedContext) {
        if (!isApiKeyConfigured()) {
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

        // Normalized endpoint URL without query param key
        String endpointUrl = String.format("%s/v1beta/models/%s:generateContent", baseUrl, model);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);
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
                return extractTextFromResponse(response.getBody(), targetLang);
            } else {
                log.error("Gemini API returned unexpected status code: {}", response.getStatusCode());
                throw new AiServiceException("AI provider returned unexpected status: " + response.getStatusCode());
            }

        } catch (HttpStatusCodeException ex) {
            String responseBody = ex.getResponseBodyAsString();
            String sanitizedDetails = extractErrorMessageDetails(responseBody);
            int statusVal = ex.getStatusCode().value();

            if (statusVal == 404) {
                log.error("Gemini request failed: HTTP 404. Model: {}, Endpoint: {}, Details: {}", model, endpointUrl, sanitizedDetails);
                throw new AiServiceException("AI service error (404): Configured Gemini model (" + model + ") was not found or is unavailable at endpoint: " + endpointUrl + (sanitizedDetails.isEmpty() ? "" : ". Details: " + sanitizedDetails));
            } else if (statusVal == 403) {
                log.error("Gemini request failed: HTTP 403. Details: {}", sanitizedDetails);
                throw new AiServiceException("AI service error (403): Invalid or unauthorized Gemini API key.");
            } else if (statusVal == 429) {
                log.error("Gemini request failed: HTTP 429. Details: {}", sanitizedDetails);
                throw new AiServiceException("AI service error (429): Rate limit or API quota exceeded. Please wait a moment and try again.");
            } else if (statusVal == 400) {
                log.error("Gemini request failed: HTTP 400. Details: {}", sanitizedDetails);
                throw new AiServiceException("AI service error (400): " + (sanitizedDetails.isEmpty() ? "Invalid request arguments." : sanitizedDetails));
            } else if (statusVal >= 500) {
                log.error("Gemini request failed: HTTP {}. Details: {}", statusVal, sanitizedDetails);
                throw new AiServiceException("AI service error (" + statusVal + "): Gemini AI service is temporarily unavailable. Please try again later.");
            } else {
                log.error("Gemini request failed: HTTP {}. Details: {}", statusVal, sanitizedDetails);
                throw new AiServiceException("AI service error (" + statusVal + "): " + sanitizedDetails);
            }

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

    @Override
    public String testConnection() {
        return generateResponse("Say exactly: Gemini connection successful", PreferredLanguage.EN);
    }

    /**
     * Validates if the configured model exists in the Gemini model repository.
     * Optional diagnostics helper (non-blocking for chat).
     */
    public ModelValidationResult validateModel() {
        if (!isApiKeyConfigured()) {
            return new ModelValidationResult(false, "Gemini API key is not configured.", Collections.emptyList());
        }
        try {
            String listUrl = String.format("%s/v1beta/models", baseUrl);
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-goog-api-key", apiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    listUrl,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode modelsArray = root.path("models");
                List<String> availableModels = new ArrayList<>();
                boolean foundConfigured = false;
                boolean supportsGenerateContent = false;

                String targetModelFullName = "models/" + model;

                if (modelsArray.isArray()) {
                    for (JsonNode m : modelsArray) {
                        String name = m.path("name").asText("");
                        availableModels.add(name);
                        if (name.equalsIgnoreCase(targetModelFullName) || name.equalsIgnoreCase(model)) {
                            foundConfigured = true;
                            JsonNode methods = m.path("supportedGenerationMethods");
                            if (methods.isArray()) {
                                for (JsonNode method : methods) {
                                    if ("generateContent".equalsIgnoreCase(method.asText())) {
                                        supportsGenerateContent = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (foundConfigured && supportsGenerateContent) {
                    return new ModelValidationResult(true, "Model '" + model + "' is verified and supports generateContent.", availableModels);
                } else if (foundConfigured) {
                    return new ModelValidationResult(false, "Model '" + model + "' exists but does not support generateContent.", availableModels);
                } else {
                    return new ModelValidationResult(false, "Model '" + model + "' was not found in available models list.", availableModels);
                }
            } else {
                return new ModelValidationResult(false, "Failed to fetch model list (status: " + response.getStatusCode() + ").", Collections.emptyList());
            }
        } catch (Exception e) {
            log.warn("Gemini model validation check failed: {}", e.getMessage());
            return new ModelValidationResult(false, "Model validation check failed: " + e.getMessage(), Collections.emptyList());
        }
    }

    public static String normalizeModelName(String rawModel) {
        if (rawModel == null || rawModel.trim().isEmpty()) {
            return DEFAULT_MODEL;
        }
        String trimmed = rawModel.trim();
        while (trimmed.startsWith("/")) {
            trimmed = trimmed.substring(1).trim();
        }
        if (trimmed.startsWith("models/")) {
            trimmed = trimmed.substring("models/".length()).trim();
        }
        if (trimmed.endsWith(":generateContent")) {
            trimmed = trimmed.substring(0, trimmed.length() - ":generateContent".length()).trim();
        }
        return trimmed.isEmpty() ? DEFAULT_MODEL : trimmed;
    }

    public static String normalizeBaseUrl(String rawBaseUrl) {
        if (rawBaseUrl == null || rawBaseUrl.trim().isEmpty()) {
            return DEFAULT_BASE_URL;
        }
        String trimmed = rawBaseUrl.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1).trim();
        }
        return trimmed.isEmpty() ? DEFAULT_BASE_URL : trimmed;
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

    private String extractTextFromResponse(String responseBody, PreferredLanguage language) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                String finishReason = firstCandidate.path("finishReason").asText("");

                JsonNode parts = firstCandidate.path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (JsonNode part : parts) {
                        String text = part.path("text").asText("");
                        if (!text.isEmpty()) {
                            sb.append(text);
                        }
                    }
                    String generatedText = sb.toString().trim();
                    if (!generatedText.isEmpty()) {
                        return generatedText;
                    }
                }

                // Handle safety-filtered responses
                if ("SAFETY".equalsIgnoreCase(finishReason) || "BLOCKLIST".equalsIgnoreCase(finishReason) || "PROHIBITED_CONTENT".equalsIgnoreCase(finishReason)) {
                    log.warn("Gemini response was blocked by safety filters [finishReason={}]", finishReason);
                    return switch (language) {
                        case MR -> "सुरक्षा धोरणांमुळे या प्रश्नाचे उत्तर तयार करता आले नाही. कृपया शेतीशी संबंधित इतर प्रश्न विचारा किंवा स्थानिक कृषी सेवा केंद्राशी संपर्क साधा.";
                        case HI -> "सुरक्षा नीतियों के कारण इस प्रश्न का उत्तर तैयार नहीं किया जा सका। कृपया कृषि से संबंधित अन्य प्रश्न पूछें या स्थानीय कृषि सेवा केंद्र से संपर्क करें।";
                        default -> "The response could not be generated due to safety policies. Please rephrase your agricultural query or consult your local Krishi Seva Kendra.";
                    };
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

    private String extractErrorMessageDetails(String responseBody) {
        if (responseBody == null || responseBody.trim().isEmpty()) {
            return "";
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode errorNode = root.path("error");
            if (!errorNode.isMissingNode()) {
                String message = errorNode.path("message").asText("");
                if (message != null && !message.isEmpty()) {
                    return message.replaceAll("(?i)key=[^&\\s]+", "key=[PROTECTED]")
                            .replaceAll("(?i)x-goog-api-key[:=][^&\\s]+", "x-goog-api-key=[PROTECTED]");
                }
            }
        } catch (Exception ignored) {
        }
        return responseBody.replaceAll("(?i)key=[^&\\s]+", "key=[PROTECTED]");
    }

    public String getModel() {
        return model;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }

    public record ModelValidationResult(boolean valid, String message, List<String> availableModels) {}
}