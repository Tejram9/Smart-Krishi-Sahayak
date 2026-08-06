package com.smartkrishisahayak.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.request.LoginRequest;
import com.smartkrishisahayak.dto.request.RegisterRequest;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.UserRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Successful Farmer Registration")
    void testFarmerRegistrationSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("Ramesh Patil", "9876543210", "Farmer@123", PreferredLanguage.MR, "Nashik");
        request.setEmail("ramesh@example.com");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ROLE_FARMER"))
                .andExpect(jsonPath("$.data.mobileNumber").value("9876543210"));
    }

    @Test
    @DisplayName("2. Duplicate Mobile and Email Rejection")
    void testDuplicateRegistrationRejection() throws Exception {
        User existingUser = new User("Existing Farmer", "9876543210", passwordEncoder.encode("Pass123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        existingUser.setEmail("existing@example.com");
        userRepository.save(existingUser);

        // Duplicate Mobile
        RegisterRequest dupMobile = new RegisterRequest("New Farmer", "9876543210", "Pass12345", PreferredLanguage.EN, "Pune");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupMobile)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Mobile number is already registered. Please login."));

        // Duplicate Email
        RegisterRequest dupEmail = new RegisterRequest("New Farmer 2", "9111111111", "Pass12345", PreferredLanguage.EN, "Pune");
        dupEmail.setEmail("existing@example.com");
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupEmail)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email address is already registered."));
    }

    @Test
    @DisplayName("3. Password is BCrypt Hashed in Database")
    void testPasswordIsBcryptHashed() {
        User user = new User("Test User", "9988776655", passwordEncoder.encode("SecretPass123"), PreferredLanguage.EN, UserRole.ROLE_FARMER);
        User savedUser = userRepository.save(user);

        assertThat(savedUser.getPasswordHash()).isNotEqualTo("SecretPass123");
        assertThat(passwordEncoder.matches("SecretPass123", savedUser.getPasswordHash())).isTrue();
    }

    @Test
    @DisplayName("4. Login Success & JWT Generation")
    void testLoginSuccess() throws Exception {
        User user = new User("Valid Farmer", "9876543210", passwordEncoder.encode("Farmer@123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest("9876543210", "Farmer@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.role").value("ROLE_FARMER"));
    }

    @Test
    @DisplayName("5. Login Failure Returns HTTP 401")
    void testLoginFailure() throws Exception {
        User user = new User("Valid Farmer", "9876543210", passwordEncoder.encode("Farmer@123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        userRepository.save(user);

        LoginRequest wrongPass = new LoginRequest("9876543210", "WrongPassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPass)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid mobile number/email or password."));
    }

    @Test
    @DisplayName("6. JWT Generation & 7. Validation")
    void testJwtGenerationAndValidation() {
        String token = jwtService.generateTokenFromUserId(100L, "ROLE_FARMER", "9876543210");
        assertThat(token).isNotEmpty();
        assertThat(jwtService.validateToken(token)).isTrue();
        assertThat(jwtService.getUserIdFromJwt(token)).isEqualTo(100L);
    }

    @Test
    @DisplayName("8. Invalid/Malformed Token Rejection")
    void testInvalidTokenRejection() {
        assertThat(jwtService.validateToken("invalid.jwt.token")).isFalse();
    }

    @Test
    @DisplayName("9. /api/v1/auth/me with Valid JWT & 10. Without JWT")
    void testGetCurrentUserWithAndWithoutJwt() throws Exception {
        User user = new User("Ramesh Patil", "9876543210", passwordEncoder.encode("Pass123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        User savedUser = userRepository.save(user);

        String token = jwtService.generateTokenFromUserId(savedUser.getId(), savedUser.getRole().name(), savedUser.getMobileNumber());

        // Without JWT -> 401
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        // With Valid JWT -> 200 OK
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Ramesh Patil"))
                .andExpect(jsonPath("$.data.mobileNumber").value("9876543210"))
                .andExpect(jsonPath("$.data.role").value("ROLE_FARMER"));
    }

    @Test
    @DisplayName("11. Farmer Access & 12. Admin Access & 13. Role Authorization Protection")
    void testRoleBasedAuthorization() throws Exception {
        User farmerUser = new User("Farmer User", "9111111111", passwordEncoder.encode("Pass123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        User adminUser = new User("Admin User", "9999999999", passwordEncoder.encode("AdminPass123"), PreferredLanguage.EN, UserRole.ROLE_ADMIN);

        userRepository.save(farmerUser);
        userRepository.save(adminUser);

        String farmerToken = jwtService.generateTokenFromUserId(farmerUser.getId(), farmerUser.getRole().name(), farmerUser.getMobileNumber());
        String adminToken = jwtService.generateTokenFromUserId(adminUser.getId(), adminUser.getRole().name(), adminUser.getMobileNumber());

        // Farmer attempts Admin endpoint -> 403 Forbidden
        mockMvc.perform(get("/api/v1/admin/test")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        // Admin attempts Admin endpoint -> 200 OK
        mockMvc.perform(get("/api/v1/admin/test")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("ADMIN_ACCESS_GRANTED"));
    }
}
