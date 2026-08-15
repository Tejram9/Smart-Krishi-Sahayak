package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.service.AiChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * DEVELOPMENT / OFFLINE mock implementation of {@link AiChatService}.
 * Returns a predefined agriculture placeholder message in EN, MR, or HI.
 * No network calls. No API keys required.
 * Activated by default when app.ai.provider is 'mock' or missing.
 *
 * <p><b>IMPORTANT:</b> The responses produced here are development mocks, not real agricultural advice.
 */
@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAiChatServiceImpl implements AiChatService {

    private static final Logger log = LoggerFactory.getLogger(MockAiChatServiceImpl.class);

    private static final String MOCK_EN =
            "[MOCK AI] Your farming question has been received. " +
            "A verified agricultural answer will be generated in a later AI integration step. " +
            "For urgent guidance, please contact your local Krishi Seva Kendra.";

    private static final String MOCK_MR =
            "[MOCK AI] तुमचा शेतीविषयक प्रश्न प्राप्त झाला आहे. " +
            "पुढील टप्प्यात सत्यापित कृषी माहितीच्या आधारे AI उत्तर दिले जाईल. " +
            "तातडीच्या मार्गदर्शनासाठी कृपया तुमच्या स्थानिक कृषी सेवा केंद्राशी संपर्क करा.";

    private static final String MOCK_HI =
            "[MOCK AI] आपका कृषि संबंधी प्रश्न प्राप्त हुआ है. " +
            "अगले चरण में सत्यापित कृषि जानकारी के आधार पर AI उत्तर तैयार किया जाएगा. " +
            "तत्काल मार्गदर्शन के लिए कृपया अपने स्थानीय कृषि सेवा केंद्र से संपर्क करें.";

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