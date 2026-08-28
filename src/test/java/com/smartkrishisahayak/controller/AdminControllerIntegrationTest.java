package com.smartkrishisahayak.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.request.CropCreateUpdateRequest;
import com.smartkrishisahayak.dto.request.GuidanceCreateUpdateRequest;
import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.CropRepository;
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
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String farmerToken;
    private User testFarmer;
    private Crop testCrop;

    @BeforeEach
    void setUp() {
        // Setup Admin User
        User admin = userRepository.findByMobileNumber("9999999999").orElseGet(() -> {
            User u = new User("System Admin", "9999999999",
                    passwordEncoder.encode("Admin@123"), PreferredLanguage.EN, UserRole.ROLE_ADMIN);
            u.setEmail("admin@test.gov.in");
            return userRepository.save(u);
        });
        adminToken = jwtService.generateTokenFromUserId(admin.getId(), admin.getRole().name(), admin.getMobileNumber());

        // Setup Farmer User
        testFarmer = userRepository.findByMobileNumber("9876543210").orElseGet(() -> {
            User u = new User("Ramesh Patil", "9876543210",
                    passwordEncoder.encode("Password@123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
            u.setEmail("ramesh@test.com");
            return userRepository.save(u);
        });
        farmerToken = jwtService.generateTokenFromUserId(testFarmer.getId(), testFarmer.getRole().name(), testFarmer.getMobileNumber());

        // Setup Test Crop
        testCrop = cropRepository.findAll().stream().findFirst().orElseGet(() -> {
            Crop c = new Crop("Test Cotton", "कापूस", "कपास", "Commercial", "Kharif", "Black Soil", "Medium", "Cotton description");
            return cropRepository.save(c);
        });
    }

    @Test
    @DisplayName("Admin can fetch system analytics stats")
    void testGetAnalyticsStats() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalFarmers", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.languageDistribution", notNullValue()))
                .andExpect(jsonPath("$.data.recentQueriesPerDay", hasSize(7)));
    }

    @Test
    @DisplayName("Farmer is forbidden from accessing admin endpoints (HTTP 403)")
    void testFarmerAccessForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/stats")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin can list registered farmers")
    void testGetUsers() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", not(empty())));
    }

    @Test
    @DisplayName("Admin can toggle user active status")
    void testToggleUserStatus() throws Exception {
        mockMvc.perform(put("/api/v1/admin/users/" + testFarmer.getId() + "/toggle-status")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.enabled", is(false)));
    }

    @Test
    @DisplayName("Admin can create, update, and delete a crop")
    void testCropCrud() throws Exception {
        CropCreateUpdateRequest createReq = new CropCreateUpdateRequest();
        createReq.setNameEn("Mustard Seed");
        createReq.setNameMr("मोहरी");
        createReq.setNameHi("सरसों");
        createReq.setCategory("Oilseeds");
        createReq.setSuitableSeason("Rabi");
        createReq.setSoilRequirements("Sandy Loam to Clay");
        createReq.setWaterRequirement("Low");
        createReq.setDescription("Valuable winter oilseed crop.");

        // 1. Create Crop
        String createResponse = mockMvc.perform(post("/api/v1/admin/crops")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.nameEn", is("Mustard Seed")))
                .andReturn().getResponse().getContentAsString();

        Long createdCropId = objectMapper.readTree(createResponse).get("data").get("id").asLong();

        // 2. Add Advisory to Created Crop
        GuidanceCreateUpdateRequest guidanceReq = new GuidanceCreateUpdateRequest();
        guidanceReq.setTitle("Mustard Aphid Integrated Management");
        guidanceReq.setContentBody("Spray dimethoate 30 EC @ 1.5 ml/l when aphids exceed ETL.");
        guidanceReq.setCategory("Pest Control");
        guidanceReq.setLanguage(PreferredLanguage.EN);
        guidanceReq.setPublished(true);

        mockMvc.perform(post("/api/v1/admin/crops/" + createdCropId + "/guidance")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(guidanceReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Mustard Aphid Integrated Management")));

        // 3. Update Crop
        createReq.setDescription("Updated description for mustard crop.");
        mockMvc.perform(put("/api/v1/admin/crops/" + createdCropId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.description", is("Updated description for mustard crop.")));

        // 4. Delete Crop
        mockMvc.perform(delete("/api/v1/admin/crops/" + createdCropId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("Admin can retrieve chat queries audit logs")
    void testGetChatQueries() throws Exception {
        mockMvc.perform(get("/api/v1/admin/chat-queries?limit=10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", notNullValue()));
    }
}
