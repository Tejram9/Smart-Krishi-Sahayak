package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.service.AiChatService;
import com.smartkrishisahayak.service.impl.MockAiChatServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "app.ai.provider=mock"
})
@ActiveProfiles("test")
class MockProviderIntegrationTest {

    @Autowired
    private AiChatService activeAiChatService;

    @Test
    @DisplayName("Verify that MockAiChatServiceImpl is the active bean when app.ai.provider=mock")
    void verifyMockProviderIsActive() {
        assertThat(activeAiChatService)
                .isNotNull()
                .isInstanceOf(MockAiChatServiceImpl.class);
    }
}