package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.service.AiChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * DEVELOPMENT / OFFLINE mock implementation of AiChatService.
 * Returns a predefined agriculture placeholder message in EN, MR, or HI.
 * No network calls. No API keys required.
 * Annotated @Primary so it is auto-wired by default.
 * IMPORTANT: responses here are NOT real agricultural advice.
 */
@Service
@Primary
public class MockAiChatServiceImpl implements AiChatService {

    private static final Logger log = LoggerFactory.getLogger(MockAiChatServiceImpl.class);

    private static final String MOCK_EN =
            "[MOCK AI] Your farming question has been received. " +
            "A verified agricultural answer will be generated in a later AI integration step. " +
            "For urgent guidance, please contact your local Krishi Seva Kendra.";

    private static final String MOCK_MR =
            "[MOCK AI] \u062a\u0941\u092e\u091a\u093e \u0936\u0947\u0924\u0940\u0935\u093f\u0937\u092f\u0915 \u092a\u094d\u0930\u0936\u094d\u0928 \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u091d\u093e\u0932\u093e \u0906\u0939\u0947. " +
            "\u092a\u0941\u0922\u0940\u0932 \u091f\u092a\u094d\u092a\u094d\u092f\u093e\u0924 \u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0915\u0943\u0937\u0940 \u092e\u093e\u0939\u093f\u0924\u0940\u091a\u094d\u092f\u093e \u0906\u0927\u093e\u0930\u0947 AI \u0909\u0924\u094d\u0924\u0930 \u0926\u093f\u0932\u0947 \u091c\u093e\u0908\u0932. " +
            "\u0924\u093e\u0924\u094d\u0921\u0940\u091a\u094d\u092f\u093e \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928\u093e\u0938\u093e\u0920\u0940 \u0915\u0943\u092a\u092f\u093e \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0938\u094d\u0925\u093e\u0928\u093f\u0915 \u0915\u0943\u0937\u0940 \u0938\u0947\u0935\u093e \u0915\u0947\u0902\u0926\u094d\u0930\u093e\u0936\u0940 \u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u093e.";

    private static final String MOCK_HI =
            "[MOCK AI] \u0906\u092a\u0915\u093e \u0915\u0943\u0937\u093f \u0938\u0902\u092c\u0902\u0927\u0940 \u092a\u094d\u0930\u0936\u094d\u0928 \u092a\u094d\u0930\u093e\u092a\u094d\u0924 \u0939\u0941\u0906 \u0939\u0948. " +
            "\u0905\u0917\u0932\u0947 \u091a\u0930\u0923 \u092e\u0947\u0902 \u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0915\u0943\u0937\u093f \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u0915\u0947 \u0906\u0927\u093e\u0930 \u092a\u0930 AI \u0909\u0924\u094d\u0924\u0930 \u0924\u0948\u092f\u093e\u0930 \u0915\u093f\u092f\u093e \u091c\u093e\u090f\u0917\u093e. " +
            "\u0924\u0924\u094d\u0915\u093e\u0932 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0915\u0947 \u0932\u093f\u090f \u0915\u0943\u092a\u092f\u093e \u0905\u092a\u0928\u0947 \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u0915\u0943\u0937\u093f \u0938\u0947\u0935\u093e \u0915\u0947\u0902\u0926\u094d\u0930 \u0938\u0947 \u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0902.";

    @Override
    public String generateResponse(String userQuery, PreferredLanguage language) {
        log.info("[MOCK AI] Generating mock response for query (length={}) in language={}",
                userQuery == null ? 0 : userQuery.length(), language);
        if (language == null) {
            return MOCK_EN;
        }
        return switch (language) {
            case MR -> MOCK_MR;
            case HI -> MOCK_HI;
            default -> MOCK_EN;
        };
    }
}