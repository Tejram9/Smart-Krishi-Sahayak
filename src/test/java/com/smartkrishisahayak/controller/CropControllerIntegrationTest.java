package com.smartkrishisahayak.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CropControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private VerifiedAgricultureContentRepository contentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private String farmerToken;
    private User adminUser;
    private Crop testCotton;
    private Crop testSoybean;
    private Crop testWheat;

    @BeforeEach
    void setUp() {
        contentRepository.deleteAll();
        cropRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Farmer user and JWT token
        User farmer = new User("Ramesh Patil", "9876543210", passwordEncoder.encode("Pass123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        User savedFarmer = userRepository.save(farmer);
        farmerToken = jwtService.generateTokenFromUserId(savedFarmer.getId(), savedFarmer.getRole().name(), savedFarmer.getMobileNumber());

        // 2. Create Admin user for authoring verified content
        adminUser = new User("System Admin", "9999999999", passwordEncoder.encode("AdminPass123"), PreferredLanguage.EN, UserRole.ROLE_ADMIN);
        adminUser = userRepository.save(adminUser);

        // 3. Create Test Crops
        testCotton = new Crop("Cotton", "कापूस", "कपास", "Commercial", "Kharif", "Black Soil", "Medium", "Cotton crop description");
        testCotton = cropRepository.save(testCotton);

        testSoybean = new Crop("Soybean", "सोयाबीन", "सोयाबीन", "Commercial", "Kharif", "Clay loam", "Medium", "Soybean crop description");
        testSoybean = cropRepository.save(testSoybean);

        testWheat = new Crop("Wheat", "गहू", "गेहूं", "Cereals", "Rabi", "Heavy black soil", "Medium", "Wheat crop description");
        testWheat = cropRepository.save(testWheat);

        // 4. Create Published & Unpublished Content
        VerifiedAgricultureContent publishedAdvisoryEn = new VerifiedAgricultureContent(
                testCotton, adminUser, "Pink Bollworm IPM", "Apply Neem Oil 1500ppm", "Pest Control", PreferredLanguage.EN, true
        );
        contentRepository.save(publishedAdvisoryEn);

        VerifiedAgricultureContent publishedAdvisoryMr = new VerifiedAgricultureContent(
                testCotton, adminUser, "गुलाबी बोंडअळी नियंत्रण", "५% निंबोळी अर्क फवारावा", "Pest Control", PreferredLanguage.MR, true
        );
        contentRepository.save(publishedAdvisoryMr);

        VerifiedAgricultureContent unpublishedDraft = new VerifiedAgricultureContent(
                testCotton, adminUser, "Unpublished Draft Advisory", "Internal draft", "Pest Control", PreferredLanguage.EN, false
        );
        contentRepository.save(unpublishedDraft);
    }

    @Test
    @DisplayName("1. Authenticated Farmer can retrieve all crops")
    void testGetAllCropsSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/crops")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[*].nameEn", containsInAnyOrder("Cotton", "Soybean", "Wheat")));
    }

    @Test
    @DisplayName("2. Search crops by English, Marathi, or Hindi keywords")
    void testSearchCropsByMultilingualKeywords() throws Exception {
        // English search
        mockMvc.perform(get("/api/v1/crops?keyword=Cotton")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].nameEn").value("Cotton"));

        // Marathi search
        mockMvc.perform(get("/api/v1/crops?keyword=सोयाबीन")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].nameEn").value("Soybean"));

        // Hindi search
        mockMvc.perform(get("/api/v1/crops?keyword=गेहूं")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].nameEn").value("Wheat"));
    }

    @Test
    @DisplayName("3. Filter crops by category and season")
    void testFilterCropsByCategoryAndSeason() throws Exception {
        // Filter by Category
        mockMvc.perform(get("/api/v1/crops?category=Commercial")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].nameEn", containsInAnyOrder("Cotton", "Soybean")));

        // Filter by Season
        mockMvc.perform(get("/api/v1/crops?season=Rabi")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].nameEn").value("Wheat"));
    }

    @Test
    @DisplayName("4. Retrieve crop details with published verified guidance")
    void testGetCropByIdSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/crops/" + testCotton.getId())
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testCotton.getId()))
                .andExpect(jsonPath("$.data.nameEn").value("Cotton"))
                .andExpect(jsonPath("$.data.nameMr").value("कापूस"))
                .andExpect(jsonPath("$.data.verifiedContents", hasSize(2)))
                .andExpect(jsonPath("$.data.verifiedContents[*].title", containsInAnyOrder("Pink Bollworm IPM", "गुलाबी बोंडअळी नियंत्रण")));
    }

    @Test
    @DisplayName("5. Non-existent crop returns HTTP 404 Not Found")
    void testGetCropByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/crops/999999")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Crop not found with id : '999999'"));
    }

    @Test
    @DisplayName("6. Unpublished draft content is NEVER returned to farmers")
    void testUnpublishedContentNotReturned() throws Exception {
        mockMvc.perform(get("/api/v1/crops/" + testCotton.getId())
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verifiedContents[*].title", not(hasItem("Unpublished Draft Advisory"))));
    }

    @Test
    @DisplayName("7. Marathi and Hindi language preference in crop details")
    void testMultilingualLanguagePreference() throws Exception {
        mockMvc.perform(get("/api/v1/crops/" + testCotton.getId() + "?language=MR")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verifiedContents[0].language").value("MR"))
                .andExpect(jsonPath("$.data.verifiedContents[0].title").value("गुलाबी बोंडअळी नियंत्रण"));
    }

    @Test
    @DisplayName("8. Unauthenticated request to /api/v1/crops returns 401 Unauthorized")
    void testUnauthenticatedRequestRejection() throws Exception {
        mockMvc.perform(get("/api/v1/crops"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }
}
