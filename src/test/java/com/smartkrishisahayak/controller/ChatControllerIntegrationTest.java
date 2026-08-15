package com.smartkrishisahayak.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.entity.ChatMessage;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.MessageSender;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.ChatMessageRepository;
import com.smartkrishisahayak.repository.ChatSessionRepository;
import com.smartkrishisahayak.repository.CropRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.repository.VerifiedAgricultureContentRepository;
import com.smartkrishisahayak.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChatControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private ChatSessionRepository chatSessionRepository;
    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private CropRepository cropRepository;
    @Autowired private VerifiedAgricultureContentRepository contentRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private String farmerAToken;
    private String farmerBToken;
    private User farmerA;
    private User farmerB;

    @BeforeEach
    void setUp() {
        // Delete in FK-safe order: verified content -> crops -> chat messages -> sessions -> users
        contentRepository.deleteAll();
        cropRepository.deleteAll();
        chatMessageRepository.deleteAll();
        chatSessionRepository.deleteAll();
        userRepository.deleteAll();

        farmerA = userRepository.save(new User("Ramesh Patil", "9000000001",
                passwordEncoder.encode("Pass123"), PreferredLanguage.MR, UserRole.ROLE_FARMER));
        farmerAToken = jwtService.generateTokenFromUserId(farmerA.getId(), farmerA.getRole().name(), farmerA.getMobileNumber());

        farmerB = userRepository.save(new User("Suresh Sharma", "9000000002",
                passwordEncoder.encode("Pass456"), PreferredLanguage.HI, UserRole.ROLE_FARMER));
        farmerBToken = jwtService.generateTokenFromUserId(farmerB.getId(), farmerB.getRole().name(), farmerB.getMobileNumber());
    }

    @Test
    @DisplayName("Test 1: Authenticated farmer can create a chat session")
    void createSession_authenticatedFarmer_returnsCreated() throws Exception {
        mockMvc.perform(post("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.sessionTitle").value(containsString("Chat Session")))
                .andExpect(jsonPath("$.data.language").value("MR"))
                .andExpect(jsonPath("$.data.messageCount").value(0));
    }

    @Test
    @DisplayName("Test 2: Unauthenticated request to create session returns 401")
    void createSession_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/chat/sessions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 3: Farmer can send a message to their own session")
    void sendMessage_ownSession_returnsOk() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "Which crops are best for black soil?");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sessionId").value(sessionId))
                .andExpect(jsonPath("$.data.userMessage.sender").value("USER"))
                .andExpect(jsonPath("$.data.aiMessage.sender").value("AI"));
    }

    @Test
    @DisplayName("Test 4: USER message is stored in the database")
    void sendMessage_userMessagePersisted() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "How to grow onions in summer?");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        List<ChatMessage> messages = chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(sessionId);
        assertThat(messages).hasSizeGreaterThanOrEqualTo(1);
        ChatMessage userMsg = messages.stream()
                .filter(m -> m.getSender() == MessageSender.USER).findFirst().orElseThrow();
        assertThat(userMsg.getMessageText()).isEqualTo("How to grow onions in summer?");
    }

    @Test
    @DisplayName("Test 5: AI message is stored in the database")
    void sendMessage_aiMessagePersisted() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "What is the best fertilizer for wheat?");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        List<ChatMessage> messages = chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(sessionId);
        assertThat(messages.stream().anyMatch(m -> m.getSender() == MessageSender.AI)).isTrue();
    }

    @Test
    @DisplayName("Test 6: Mock AI response body contains [MOCK AI] tag")
    void sendMessage_mockAiResponseReturned() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "Pest control tips for cotton?");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("[MOCK AI]")));
    }

    @Test
    @DisplayName("Test 7: Mock AI response respects Marathi language request")
    void sendMessage_marathiLanguage_messageLanguageIsMR() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "Crop question");
        request.put("language", "MR");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aiMessage.language").value("MR"));
    }

    @Test
    @DisplayName("Test 8: Farmer can list own sessions")
    void getUserSessions_returnsFarmerOwnSessions() throws Exception {
        createSessionForFarmerA();
        createSessionForFarmerA();

        mockMvc.perform(get("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    @DisplayName("Test 9: Farmer A session list does not include Farmer B sessions")
    void getUserSessions_doesNotIncludeOtherFarmerSessions() throws Exception {
        createSessionForFarmerA();
        mockMvc.perform(post("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerBToken))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("Test 10: Farmer can retrieve messages from own session chronologically")
    void getSessionMessages_ownSession_returnsChronologicalMessages() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> msg = new HashMap<>();
        msg.put("message", "What crops suit black soil?");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(msg)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].sender").value("USER"))
                .andExpect(jsonPath("$.data[1].sender").value("AI"));
    }

    @Test
    @DisplayName("Test 11: Farmer A cannot send message to Farmer B session - returns 403")
    void sendMessage_otherFarmerSession_returns403() throws Exception {
        String sessionJson = mockMvc.perform(post("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerBToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long farmerBSessionId = objectMapper.readTree(sessionJson).get("data").get("id").asLong();

        Map<String, String> request = new HashMap<>();
        request.put("message", "Unauthorized access attempt");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", farmerBSessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 12: Farmer A cannot read messages from Farmer B session - returns 403")
    void getSessionMessages_otherFarmerSession_returns403() throws Exception {
        String sessionJson = mockMvc.perform(post("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerBToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long farmerBSessionId = objectMapper.readTree(sessionJson).get("data").get("id").asLong();

        mockMvc.perform(get("/api/v1/chat/sessions/{sessionId}/messages", farmerBSessionId)
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test 13: Sending message to non-existent session returns 404")
    void sendMessage_nonExistentSession_returns404() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("message", "Test message");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", 99999L)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Test 14: Blank message is rejected with 400")
    void sendMessage_blankMessage_returns400() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "   ");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Test 15: Off-topic query receives polite agricultural redirect")
    void sendMessage_offTopicQuery_returnsPoliteRedirect() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "Who won yesterday's football match?");
        request.put("language", "EN");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("Smart Krishi Sahayak")))
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("agriculture-related question")));
    }

    @Test
    @DisplayName("Test 16: Marathi off-topic query receives Marathi redirect")
    void sendMessage_marathiOffTopicQuery_returnsMarathiRedirect() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "पायथन कोड कसा लिहावा?");
        request.put("language", "MR");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("स्मार्ट कृषी सहाय्यक")))
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("शेतीशी संबंधित प्रश्न विचारा")));
    }

    @Test
    @DisplayName("Test 17: Hindi off-topic query receives Hindi redirect")
    void sendMessage_hindiOffTopicQuery_returnsHindiRedirect() throws Exception {
        Long sessionId = createSessionForFarmerB();
        Map<String, String> request = new HashMap<>();
        request.put("message", "आज का क्रिकेट मैच कौन जीता?");
        request.put("language", "HI");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("स्मार्ट कृषि सहायक")))
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("कृषि से संबंधित प्रश्न पूछें")));
    }

    @Test
    @DisplayName("Test 18: High-risk query receives expert referral guidance in response")
    void sendMessage_highRiskDosageQuery_includesExpertReferral() throws Exception {
        Long sessionId = createSessionForFarmerA();
        Map<String, String> request = new HashMap<>();
        request.put("message", "Give me the exact pesticide dosage and mixing ratio for chemical spray");
        request.put("language", "EN");

        mockMvc.perform(post("/api/v1/chat/sessions/{sessionId}/messages", sessionId)
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.aiMessage.message").value(containsString("Krishi Seva Kendra")));
    }

    private Long createSessionForFarmerA() throws Exception {
        String responseBody = mockMvc.perform(post("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(responseBody).get("data").get("id").asLong();
    }

    private Long createSessionForFarmerB() throws Exception {
        String responseBody = mockMvc.perform(post("/api/v1/chat/sessions")
                        .header("Authorization", "Bearer " + farmerBToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(responseBody).get("data").get("id").asLong();
    }
}