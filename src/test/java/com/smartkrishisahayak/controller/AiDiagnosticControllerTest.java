package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.service.AiChatService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiDiagnosticControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AiChatService aiChatService;

    @Test
    @DisplayName("Public GET /api/v1/ai/health returns configured status without auth")
    void getAiHealth_public_success() throws Exception {
        when(aiChatService.getProviderName()).thenReturn("gemini");
        when(aiChatService.getModelName()).thenReturn("gemini-2.5-flash");
        when(aiChatService.isApiKeyConfigured()).thenReturn(true);

        mockMvc.perform(get("/api/v1/ai/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.provider").value("gemini"))
                .andExpect(jsonPath("$.data.model").value("gemini-2.5-flash"))
                .andExpect(jsonPath("$.data.apiKeyConfigured").value(true))
                .andExpect(jsonPath("$.data.status").value("configured"));
    }

    @Test
    @DisplayName("Public GET /api/ai/health fallback path returns configured status")
    void getAiHealth_fallbackPath_success() throws Exception {
        when(aiChatService.getProviderName()).thenReturn("gemini");
        when(aiChatService.getModelName()).thenReturn("gemini-2.5-flash");
        when(aiChatService.isApiKeyConfigured()).thenReturn(true);

        mockMvc.perform(get("/api/ai/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.provider").value("gemini"));
    }

    @Test
    @DisplayName("Unauthenticated POST /api/v1/ai/test-connection is forbidden/unauthorized")
    void testAiConnection_unauthenticated_forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/ai/test-connection")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "9876543210", roles = {"FARMER"})
    @DisplayName("Authenticated POST /api/v1/ai/test-connection invokes testConnection")
    void testAiConnection_authenticated_success() throws Exception {
        when(aiChatService.getProviderName()).thenReturn("gemini");
        when(aiChatService.getModelName()).thenReturn("gemini-2.5-flash");
        when(aiChatService.testConnection()).thenReturn("Gemini connection successful");

        mockMvc.perform(post("/api/v1/ai/test-connection")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.response").value("Gemini connection successful"));
    }
}
