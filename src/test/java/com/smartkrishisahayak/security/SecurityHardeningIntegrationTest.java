package com.smartkrishisahayak.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.request.AdminRegisterRequest;
import com.smartkrishisahayak.dto.request.UserReportCreateRequest;
import com.smartkrishisahayak.dto.response.UserReportResponse;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.ReportCategory;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityHardeningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private ObjectMapper objectMapper;

    private User farmerA;
    private User farmerB;
    private User adminUser;
    private String farmerAToken;
    private String farmerBToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        farmerA = userRepository.findByMobileNumber("9800000001").orElseGet(() ->
                userRepository.save(new User("Farmer Alpha", "9800000001",
                        passwordEncoder.encode("SecretPass1"), PreferredLanguage.EN, UserRole.ROLE_FARMER))
        );
        farmerAToken = jwtService.generateTokenFromUserId(farmerA.getId(), farmerA.getRole().name(), farmerA.getMobileNumber());

        farmerB = userRepository.findByMobileNumber("9800000002").orElseGet(() ->
                userRepository.save(new User("Farmer Beta", "9800000002",
                        passwordEncoder.encode("SecretPass2"), PreferredLanguage.EN, UserRole.ROLE_FARMER))
        );
        farmerBToken = jwtService.generateTokenFromUserId(farmerB.getId(), farmerB.getRole().name(), farmerB.getMobileNumber());

        adminUser = userRepository.findByMobileNumber("9900000001").orElseGet(() ->
                userRepository.save(new User("Admin Officer", "9900000001",
                        passwordEncoder.encode("AdminPass1"), PreferredLanguage.EN, UserRole.ROLE_ADMIN))
        );
        adminToken = jwtService.generateTokenFromUserId(adminUser.getId(), adminUser.getRole().name(), adminUser.getMobileNumber());
    }

    @Test
    @DisplayName("1. Security Headers: CSP, Clickjacking (X-Frame-Options), and MIME Sniffing are enforced")
    void testSecurityHeadersEnforced() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().exists("Content-Security-Policy"))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'self'")))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")));
    }

    @Test
    @DisplayName("2. CORS: Allowed origin is accepted with credentials")
    void testCorsAllowedOriginAccepted() throws Exception {
        mockMvc.perform(options("/api/v1/health")
                        .header("Origin", "https://smart-krishi-sahayak-86ks.vercel.app")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://smart-krishi-sahayak-86ks.vercel.app"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("3. CORS: Unauthorized origin does not receive Access-Control-Allow-Origin")
    void testCorsUnauthorizedOriginRejected() throws Exception {
        mockMvc.perform(options("/api/v1/health")
                        .header("Origin", "https://malicious-attacker-domain.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    @DisplayName("4. Admin Route Protection: Farmer is forbidden (403) from accessing admin endpoints")
    void testFarmerForbiddenFromAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("5. Admin Route Protection: Admin has access (200) to admin endpoints")
    void testAdminAuthorizedForAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("6. Database Ownership: Farmer A cannot view Farmer B's support report (403 Forbidden)")
    void testFarmerCannotAccessOtherFarmerReport() throws Exception {
        UserReportCreateRequest createReq = new UserReportCreateRequest(
                ReportCategory.TECHNICAL_ISSUE,
                "Irrigation sensor failure",
                "Moisture readings not syncing from field sensor."
        );
        UserReportResponse reportB = reportService.createReport(farmerB.getId(), createReq);

        // Farmer A attempts to access Farmer B's report -> 403 Forbidden
        mockMvc.perform(get("/api/v1/reports/" + reportB.getId())
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        // Farmer B accesses their own report -> 200 OK
        mockMvc.perform(get("/api/v1/reports/" + reportB.getId())
                        .header("Authorization", "Bearer " + farmerBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(reportB.getId()));
    }

    @Test
    @DisplayName("7. Admin Registration: Rejects invalid secret without leaking secret key in response")
    void testAdminRegistrationRejectsInvalidKeyWithoutLeakage() throws Exception {
        AdminRegisterRequest req = new AdminRegisterRequest(
                "Fake Officer",
                "fake.officer@example.com",
                "9871112233",
                "AdminSecret@123",
                "WrongSecretKey123"
        );

        mockMvc.perform(post("/api/v1/auth/register-admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", not(containsString("KisanAdmin"))))
                .andExpect(jsonPath("$.message", not(containsString("Admin@SecurePass"))));
    }

    @Test
    @DisplayName("8. File Upload Security: Executable script disguised as image is rejected by magic byte check")
    void testMaliciousScriptDisguisedAsImageRejected() throws Exception {
        // PHP webshell disguised with .jpg extension
        MockMultipartFile maliciousFile = new MockMultipartFile(
                "image",
                "shell.jpg",
                "image/jpeg",
                "<?php system($_GET['cmd']); ?>".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/disease/detect")
                        .file(maliciousFile)
                        .param("cropName", "Tomato")
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
