package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class WeatherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    }

    @Test
    @DisplayName("GET /api/v1/weather/current returns meteorological data")
    void testGetCurrentWeather() throws Exception {
        mockMvc.perform(get("/api/v1/weather/current")
                        .header("Authorization", "Bearer " + farmerToken)
                        .param("district", "Nashik")
                        .param("state", "Maharashtra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.location", is("Nashik")))
                .andExpect(jsonPath("$.data.temperature", notNullValue()))
                .andExpect(jsonPath("$.data.humidity", notNullValue()))
                .andExpect(jsonPath("$.data.windSpeed", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/v1/weather/advisory returns enriched agricultural advice in Marathi")
    void testGetWeatherAdvisory() throws Exception {
        mockMvc.perform(get("/api/v1/weather/advisory")
                        .header("Authorization", "Bearer " + farmerToken)
                        .param("district", "Pune")
                        .param("state", "Maharashtra")
                        .param("language", "MR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.location", is("Pune")))
                .andExpect(jsonPath("$.data.generalAdvisory", notNullValue()))
                .andExpect(jsonPath("$.data.pestDiseaseAlerts", not(empty())))
                .andExpect(jsonPath("$.data.fieldWorkRecommendations", not(empty())));
    }

    @Test
    @DisplayName("Unauthenticated request to weather is rejected with 401")
    void testUnauthenticatedWeatherRequest() throws Exception {
        mockMvc.perform(get("/api/v1/weather/current")
                        .param("district", "Pune"))
                .andExpect(status().isUnauthorized());
    }
}
