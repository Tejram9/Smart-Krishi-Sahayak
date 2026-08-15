package com.smartkrishisahayak.service;

import com.smartkrishisahayak.entity.enums.PreferredLanguage;

/**
 * Provider-independent AI chat service interface.
 * Implementations: MockAiChatServiceImpl (default/dev), GeminiAiChatServiceImpl (Phase 5C).
 */
public interface AiChatService {

    /**
     * Generate an AI response for the given user query in the specified language.
     *
     * @param userQuery the farmer's question or message
     * @param language  the preferred response language
     * @return generated response text
     */
    default String generateResponse(String userQuery, PreferredLanguage language) {
        return generateResponse(userQuery, language, null);
    }

    /**
     * Generate an AI response grounded in the provided verified agriculture context.
     *
     * @param userQuery       the farmer's question or message
     * @param language        the preferred response language
     * @param verifiedContext verified agricultural guidance from the database, or null if unavailable
     * @return generated response text
     */
    String generateResponse(String userQuery, PreferredLanguage language, String verifiedContext);
}
