package com.smartkrishisahayak.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.security.rate-limiting.enabled=true",
        "app.security.rate-limiting.login-limit=3"
})
class RateLimitingFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Rate Limiter triggers HTTP 429 when threshold exceeded on /api/v1/auth/login")
    void testRateLimitEnforcedOnLogin() throws Exception {
        String payload = "{\"mobileNumberOrEmail\":\"9999999999\",\"password\":\"wrong\"}";

        // First 3 requests reach the controller
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Forwarded-For", "192.168.1.100")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isBadRequest()); // bad credentials
        }

        // 4th request exceeds the limit -> 429 Too Many Requests
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", "192.168.1.100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", org.hamcrest.Matchers.containsString("Rate limit exceeded")));
    }
}
