package com.smartkrishisahayak.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.request.CropRecommendationRequest;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FarmingAdvisoryControllerTest {

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

    private String farmerToken;

    @BeforeEach
    void setUp() {
        User farmer = userRepository.findByMobileNumber("9876543210").orElseGet(() -> {
            User u = new User("Ramesh Patil", "9876543210",
                    passwordEncoder.encode("Password@123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
            u.setEmail("ramesh@test.com");
            return userRepository.save(u);
        });
        farmerToken = jwtService.generateTokenFromUserId(farmer.getId(), farmer.getRole().name(), farmer.getMobileNumber());

        // Ensure crop is present for recommendation test
        if (cropRepository.count() == 0) {
            Crop cotton = new Crop("Cotton", "कापूस", "कपास",
                    "Commercial", "Kharif",
                    "Deep black cotton soil (Vertisols), well-drained",
                    "Medium (500-700 mm)",
                    "High-value fiber and cash crop.");
            cropRepository.save(cotton);
        }
    }

    @Test
    @DisplayName("Farmer can get crop recommendations for Kharif season and Black Soil")
    void testRecommendCrops() throws Exception {
        CropRecommendationRequest req = new CropRecommendationRequest(
                "Kharif",
                "Black Soil",
                "Medium",
                "Nashik",
                "MR"
        );

        mockMvc.perform(post("/api/v1/advisory/recommend-crops")
                        .header("Authorization", "Bearer " + farmerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", not(empty())))
                .andExpect(jsonPath("$.data[0].matchPercentage", greaterThanOrEqualTo(50)))
                .andExpect(jsonPath("$.data[0].recommendationReason", notNullValue()));
    }

    @Test
    @DisplayName("Farmer can fetch localized weather and pest advisory")
    void testGetWeatherAdvisory() throws Exception {
        mockMvc.perform(get("/api/v1/advisory/weather")
                        .header("Authorization", "Bearer " + farmerToken)
                        .param("district", "Nashik")
                        .param("language", "MR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.location", is("Nashik")))
                .andExpect(jsonPath("$.data.currentSeason", notNullValue()))
                .andExpect(jsonPath("$.data.generalAdvisory", notNullValue()))
                .andExpect(jsonPath("$.data.pestDiseaseAlerts", not(empty())))
                .andExpect(jsonPath("$.data.fieldWorkRecommendations", not(empty())));
    }
}
