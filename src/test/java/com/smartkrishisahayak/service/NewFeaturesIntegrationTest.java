package com.smartkrishisahayak.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.request.*;
import com.smartkrishisahayak.dto.response.AuthResponse;
import com.smartkrishisahayak.dto.response.UserReportResponse;
import com.smartkrishisahayak.entity.PasswordResetToken;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.ReportCategory;
import com.smartkrishisahayak.entity.enums.ReportStatus;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.PasswordResetTokenRepository;
import com.smartkrishisahayak.repository.UserLoginActivityRepository;
import com.smartkrishisahayak.repository.UserReportRepository;
import com.smartkrishisahayak.repository.UserRepository;
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

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NewFeaturesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private UserReportRepository reportRepository;

    @Autowired
    private UserLoginActivityRepository activityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private ReportService reportService;

    private User farmerUser;
    private User adminUser;
    private String farmerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        reportRepository.deleteAll();
        resetTokenRepository.deleteAll();
        activityRepository.deleteAll();
        userRepository.findAll().stream()
                .filter(u -> !"9999999999".equals(u.getMobileNumber()))
                .forEach(userRepository::delete);

        // Seed a test farmer
        farmerUser = new User("Suresh Patil", "9898989898", passwordEncoder.encode("Farmer@123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        farmerUser.setEmail("suresh@farmer.com");
        farmerUser = userRepository.save(farmerUser);
        farmerToken = jwtService.generateTokenFromUserId(farmerUser.getId(), "ROLE_FARMER", farmerUser.getMobileNumber());

        // Find or create admin
        adminUser = userRepository.findByMobileNumber("9999999999")
                .orElseGet(() -> {
                    User a = new User("System Admin", "9999999999", passwordEncoder.encode("TestAdmin@SecurePass123"), PreferredLanguage.EN, UserRole.ROLE_ADMIN);
                    a.setEmail("admin@smartkrishi.gov.in");
                    return userRepository.save(a);
                });
        adminToken = jwtService.generateTokenFromUserId(adminUser.getId(), "ROLE_ADMIN", adminUser.getMobileNumber());
    }

    @Test
    @DisplayName("1. Role Enforcement: Farmer Login vs Admin Login")
    void testRoleEnforcementLogin() throws Exception {
        // Farmer logging in with expectedRole = ROLE_FARMER -> Success
        LoginRequest validFarmerLogin = new LoginRequest("9898989898", "Farmer@123", "ROLE_FARMER");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validFarmerLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ROLE_FARMER"));

        // Farmer trying to log in under Admin portal -> Access Denied / Bad Request
        LoginRequest farmerOnAdminPortal = new LoginRequest("9898989898", "Farmer@123", "ROLE_ADMIN");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(farmerOnAdminPortal)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Farmer")));

        // Admin logging in with expectedRole = ROLE_ADMIN -> Success
        LoginRequest validAdminLogin = new LoginRequest("9999999999", "TestAdmin@SecurePass123", "ROLE_ADMIN");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validAdminLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("2. Complete Password Recovery & Reset Flow")
    void testPasswordResetFlow() throws Exception {
        // Step 1: Request Forgot Password
        ForgotPasswordRequest forgotReq = new ForgotPasswordRequest("9898989898");
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify token created in database
        PasswordResetToken token = resetTokenRepository.findTopByUserAndUsedFalseOrderByCreatedAtDesc(farmerUser)
                .orElseThrow();
        assertThat(token.getToken()).isNotEmpty();
        assertThat(token.isExpired()).isFalse();
        assertThat(token.isUsed()).isFalse();

        // Step 2: Verify Token / OTP
        VerifyResetTokenRequest verifyReq = new VerifyResetTokenRequest("9898989898", token.getToken());
        mockMvc.perform(post("/api/v1/auth/verify-reset-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));

        // Step 3: Reset Password with New Password
        ResetPasswordRequest resetReq = new ResetPasswordRequest("9898989898", token.getToken(), "NewSecureFarmer@456");
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify token is now marked used
        PasswordResetToken usedToken = resetTokenRepository.findById(token.getId()).orElseThrow();
        assertThat(usedToken.isUsed()).isTrue();

        // Step 4: Login with old password fails, new password succeeds
        LoginRequest oldPassLogin = new LoginRequest("9898989898", "Farmer@123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldPassLogin)))
                .andExpect(status().isBadRequest());

        LoginRequest newPassLogin = new LoginRequest("9898989898", "NewSecureFarmer@456");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newPassLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("3. User Complaint / Report Submission & Admin Resolution")
    void testUserReportLifecycle() throws Exception {
        // Farmer submits a report
        UserReportCreateRequest createReq = new UserReportCreateRequest(
                ReportCategory.TECHNICAL_ISSUE,
                "Weather advisory not updating",
                "The weather tab showed an error when trying to fetch rainfall data for Pune district."
        );

        String responseJson = mockMvc.perform(post("/api/v1/reports")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.title").value("Weather advisory not updating"))
                .andReturn().getResponse().getContentAsString();

        Long reportId = objectMapper.readTree(responseJson).path("data").path("id").asLong();

        // Farmer views their own reports
        mockMvc.perform(get("/api/v1/reports/my")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        // Admin views all reports
        mockMvc.perform(get("/api/v1/admin/reports")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        // Admin updates report status and responds
        AdminReportUpdateRequest updateReq = new AdminReportUpdateRequest(
                ReportStatus.RESOLVED,
                "The weather server API key cache was refreshed and Pune data is now synchronized."
        );

        mockMvc.perform(put("/api/v1/admin/reports/" + reportId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESOLVED"))
                .andExpect(jsonPath("$.data.adminResponse").value(org.hamcrest.Matchers.containsString("Pune data is now synchronized")));
    }

    @Test
    @DisplayName("4. Login Activity Audit & Logout Duration Tracking")
    void testLoginActivityTracking() throws Exception {
        // Farmer logs in
        LoginRequest loginReq = new LoginRequest("9898989898", "Farmer@123");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk());

        // Check activity logged in database
        assertThat(activityRepository.count()).isGreaterThanOrEqualTo(1);

        // Farmer explicitly logs out
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("LOGGED_OUT"));

        // Admin checks login activities audit log
        mockMvc.perform(get("/api/v1/admin/login-activities")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("5. Detailed Admin Graphical Analytics API")
    void testDetailedAdminAnalytics() throws Exception {
        // Query /api/v1/admin/analytics/detailed as Admin
        mockMvc.perform(get("/api/v1/admin/analytics/detailed")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalFarmers").isNumber())
                .andExpect(jsonPath("$.data.totalAdmins").isNumber())
                .andExpect(jsonPath("$.data.registrationTrend").isArray())
                .andExpect(jsonPath("$.data.reportsByStatus").isMap())
                .andExpect(jsonPath("$.data.reportsByCategory").isMap())
                .andExpect(jsonPath("$.data.loginTrend").isArray());

        // Non-admin attempting to access detailed analytics is forbidden
        mockMvc.perform(get("/api/v1/admin/analytics/detailed")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isForbidden());
    }
}
