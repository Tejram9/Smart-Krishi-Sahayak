package com.smartkrishisahayak.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.exception.AiServiceException;
import com.smartkrishisahayak.service.impl.GeminiAiChatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GeminiAiChatServiceImplTest {

    private RestTemplate restTemplate;
    private MockRestServiceServer mockServer;
    private ObjectMapper objectMapper;
    private GeminiAiChatServiceImpl geminiService;

    private static final String TEST_API_KEY = "test-gemini-key-12345";
    private static final String TEST_MODEL = "gemini-1.5-flash";
    private static final String TEST_BASE_URL = "https://generativelanguage.googleapis.com";
    private static final String EXPECTED_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=test-gemini-key-12345";

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);
        objectMapper = new ObjectMapper();

        geminiService = new GeminiAiChatServiceImpl(
                TEST_API_KEY,
                TEST_MODEL,
                TEST_BASE_URL,
                5000,
                restTemplate,
                objectMapper
        );
    }

    @Test
    @DisplayName("Test 1: Successful response generation in English")
    void generateResponse_english_success() {
        String mockGeminiResponse = """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {
                        "text": "For cotton cultivation in black soil, maintain good drainage and apply balanced NPK fertilizers."
                      }
                    ],
                    "role": "model"
                  },
                  "finishReason": "STOP"
                }
              ]
            }
            """;

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.contents[0].parts[0].text").value("How to grow cotton?"))
                .andExpect(jsonPath("$.systemInstruction.parts[0].text").value(org.hamcrest.Matchers.containsString("English")))
                .andRespond(withSuccess(mockGeminiResponse, MediaType.APPLICATION_JSON));

        String response = geminiService.generateResponse("How to grow cotton?", PreferredLanguage.EN);

        assertThat(response).contains("For cotton cultivation in black soil");
        mockServer.verify();
    }

    @Test
    @DisplayName("Test 2: Successful response generation in Marathi")
    void generateResponse_marathi_success() {
        String mockGeminiResponse = """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {
                        "text": "कापूस पिकासाठी काळी कसदार जमीन योग्य असते."
                      }
                    ],
                    "role": "model"
                  },
                  "finishReason": "STOP"
                }
              ]
            }
            """;

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.systemInstruction.parts[0].text").value(org.hamcrest.Matchers.containsString("मराठी")))
                .andRespond(withSuccess(mockGeminiResponse, MediaType.APPLICATION_JSON));

        String response = geminiService.generateResponse("कापूस शेती कशी करावी?", PreferredLanguage.MR);

        assertThat(response).isEqualTo("कापूस पिकासाठी काळी कसदार जमीन योग्य असते.");
        mockServer.verify();
    }

    @Test
    @DisplayName("Test 3: Successful response generation in Hindi")
    void generateResponse_hindi_success() {
        String mockGeminiResponse = """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {
                        "text": "गेहूं की बुवाई के लिए उचित समय नवंबर का महीना है।"
                      }
                    ],
                    "role": "model"
                  },
                  "finishReason": "STOP"
                }
              ]
            }
            """;

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.systemInstruction.parts[0].text").value(org.hamcrest.Matchers.containsString("हिंदी")))
                .andRespond(withSuccess(mockGeminiResponse, MediaType.APPLICATION_JSON));

        String response = geminiService.generateResponse("गेहूं की खेती", PreferredLanguage.HI);

        assertThat(response).contains("गेहूं की बुवाई");
        mockServer.verify();
    }

    @Test
    @DisplayName("Test 4: Missing API key throws AiServiceException")
    void generateResponse_missingApiKey_throwsException() {
        GeminiAiChatServiceImpl serviceWithoutKey = new GeminiAiChatServiceImpl(
                "",
                TEST_MODEL,
                TEST_BASE_URL,
                5000,
                restTemplate,
                objectMapper
        );

        assertThatThrownBy(() -> serviceWithoutKey.generateResponse("Hello", PreferredLanguage.EN))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("Gemini API key is not configured");
    }

    @Test
    @DisplayName("Test 5: Empty user query throws AiServiceException")
    void generateResponse_emptyQuery_throwsException() {
        assertThatThrownBy(() -> geminiService.generateResponse("   ", PreferredLanguage.EN))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("User query must not be empty");
    }

    @Test
    @DisplayName("Test 6: Gemini HTTP 400 Bad Request error handled gracefully")
    void generateResponse_http400_throwsSanitizedException() {
        String errorJson = """
            {
              "error": {
                "code": 400,
                "message": "Invalid argument provided",
                "status": "INVALID_ARGUMENT"
              }
            }
            """;

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withBadRequest().body(errorJson).contentType(MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> geminiService.generateResponse("Test query", PreferredLanguage.EN))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("400")
                .hasMessageContaining("Invalid argument provided");

        mockServer.verify();
    }

    @Test
    @DisplayName("Test 7: Gemini HTTP 403 Invalid API Key handled gracefully without secret exposure")
    void generateResponse_http403_throwsSanitizedException() {
        String errorJson = """
            {
              "error": {
                "code": 403,
                "message": "API key not valid. Please pass a valid API key.",
                "status": "PERMISSION_DENIED"
              }
            }
            """;

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.FORBIDDEN).body(errorJson).contentType(MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> geminiService.generateResponse("Test query", PreferredLanguage.EN))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("403")
                .hasMessageContaining("API key not valid");

        mockServer.verify();
    }

    @Test
    @DisplayName("Test 8: Gemini HTTP 500 Server error handled safely")
    void generateResponse_http500_throwsException() {
        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        assertThatThrownBy(() -> geminiService.generateResponse("Test query", PreferredLanguage.EN))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("500");

        mockServer.verify();
    }

    @Test
    @DisplayName("Test 9: Empty candidates list in response throws AiServiceException")
    void generateResponse_emptyCandidates_throwsException() {
        String emptyCandidatesResponse = """
            {
              "candidates": []
            }
            """;

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(emptyCandidatesResponse, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> geminiService.generateResponse("Test query", PreferredLanguage.EN))
                .isInstanceOf(AiServiceException.class)
                .hasMessageContaining("empty response");

        mockServer.verify();
    }

    @Test
    @DisplayName("Test 10: Verified agriculture context is properly injected into Gemini request payload")
    void generateResponse_withVerifiedContext_injectsContextIntoPrompt() {
        String mockGeminiResponse = """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {
                        "text": "Based on verified guidance, apply Neem oil @ 5ml/L for cotton pink bollworm."
                      }
                    ],
                    "role": "model"
                  },
                  "finishReason": "STOP"
                }
              ]
            }
            """;

        String verifiedContext = "=== VERIFIED AGRICULTURE KNOWLEDGE BASE ===\nCrop: Cotton\nTitle: Pink Bollworm IPM\nVerified Guidance: Use Neem oil @ 5ml/L";

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.contents[0].parts[0].text").value(org.hamcrest.Matchers.containsString("VERIFIED AGRICULTURE KNOWLEDGE BASE")))
                .andExpect(jsonPath("$.contents[0].parts[0].text").value(org.hamcrest.Matchers.containsString("Farmer Query:\nHow to treat pink bollworm?")))
                .andExpect(jsonPath("$.systemInstruction.parts[0].text").value(org.hamcrest.Matchers.containsString("VERIFIED AGRICULTURE KNOWLEDGE BASE CONTEXT")))
                .andRespond(withSuccess(mockGeminiResponse, MediaType.APPLICATION_JSON));

        String response = geminiService.generateResponse("How to treat pink bollworm?", PreferredLanguage.EN, verifiedContext);

        assertThat(response).contains("Based on verified guidance");
        mockServer.verify();
    }

    @Test
    @DisplayName("Test 11: System prompt includes no-knowledge disclaimer rule")
    void generateResponse_systemPrompt_containsNoKnowledgeInstruction() {
        String mockGeminiResponse = """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {
                        "text": "The verified knowledge base does not contain specific information for dragon fruit."
                      }
                    ],
                    "role": "model"
                  },
                  "finishReason": "STOP"
                }
              ]
            }
            """;

        mockServer.expect(requestTo(EXPECTED_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.systemInstruction.parts[0].text").value(org.hamcrest.Matchers.containsString("No-Knowledge / Unknown Queries")))
                .andRespond(withSuccess(mockGeminiResponse, MediaType.APPLICATION_JSON));

        String response = geminiService.generateResponse("How to grow dragon fruit?", PreferredLanguage.EN, null);

        assertThat(response).contains("verified knowledge base");
        mockServer.verify();
    }
}