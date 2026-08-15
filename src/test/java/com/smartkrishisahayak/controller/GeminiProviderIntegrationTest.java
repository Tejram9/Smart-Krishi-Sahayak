package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.service.AiChatService;
import com.smartkrishisahayak.service.impl.GeminiAiChatServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "app.ai.provider=gemini",
        "app.ai.gemini.api-key=test-gemini-api-key",
        "app.ai.gemini.model=gemini-1.5-flash",
        "app.ai.gemini.timeout-ms=20000"
})
@ActiveProfiles("test")
class GeminiProviderIntegrationTest {

    @Autowired
    private AiChatService activeAiChatService;

    @Test
    @DisplayName("Verify that GeminiAiChatServiceImpl is the active bean when app.ai.provider=gemini")
    void verifyGeminiProviderIsActive() {
        assertThat(activeAiChatService)
                .isNotNull()
                .isInstanceOf(GeminiAiChatServiceImpl.class);

        GeminiAiChatServiceImpl geminiService = (GeminiAiChatServiceImpl) activeAiChatService;
        assertThat(geminiService.getModel()).isEqualTo("gemini-1.5-flash");
        assertThat(geminiService.getTimeoutMs()).isEqualTo(20000);
    }
}