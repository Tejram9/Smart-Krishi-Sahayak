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
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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
class DiseaseDetectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User farmer;
    private User admin;
    private String farmerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        farmer = userRepository.findByMobileNumber("9876543210").orElseGet(() -> {
            User u = new User("Ramesh Patil", "9876543210",
                    passwordEncoder.encode("Password@123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
            u.setEmail("ramesh@test.com");
            return userRepository.save(u);
        });
        farmerToken = jwtService.generateTokenFromUserId(farmer.getId(), farmer.getRole().name(), farmer.getMobileNumber());

        admin = userRepository.findByMobileNumber("9999999999").orElseGet(() -> {
            User u = new User("System Admin", "9999999999",
                    passwordEncoder.encode("Admin@123"), PreferredLanguage.EN, UserRole.ROLE_ADMIN);
            u.setEmail("admin@test.com");
            return userRepository.save(u);
        });
        adminToken = jwtService.generateTokenFromUserId(admin.getId(), admin.getRole().name(), admin.getMobileNumber());
    }

    @Test
    @DisplayName("Farmer can upload leaf image and receive disease detection prediction")
    void testDetectDiseaseApi() throws Exception {
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "leaf_scan.jpg", "image/jpeg", "dummy-jpg-bytes".getBytes());

        mockMvc.perform(multipart("/api/v1/disease/detect")
                        .file(imageFile)
                        .param("cropName", "Tomato")
                        .param("notes", "Dark spots with yellow borders")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.cropName", is("Tomato")))
                .andExpect(jsonPath("$.data.diseaseName", notNullValue()))
                .andExpect(jsonPath("$.data.confidence", greaterThan(80.0)))
                .andExpect(jsonPath("$.data.severity", notNullValue()))
                .andExpect(jsonPath("$.data.symptoms", notNullValue()))
                .andExpect(jsonPath("$.data.organicRemedies", notNullValue()))
                .andExpect(jsonPath("$.data.chemicalRemedies", notNullValue()))
                .andExpect(jsonPath("$.data.preventiveMeasures", notNullValue()));
    }

    @Test
    @DisplayName("Unauthenticated request to detect disease should return 401/403")
    void testDetectDiseaseUnauthenticated() throws Exception {
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "leaf_scan.jpg", "image/jpeg", "dummy-jpg-bytes".getBytes());

        mockMvc.perform(multipart("/api/v1/disease/detect")
                        .file(imageFile)
                        .param("cropName", "Tomato"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Farmer can retrieve their disease detection scan history")
    void testGetDetectionHistory() throws Exception {
        // Upload first
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "leaf1.jpg", "image/jpeg", "bytes1".getBytes());

        mockMvc.perform(multipart("/api/v1/disease/detect")
                        .file(imageFile)
                        .param("cropName", "Cotton")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isCreated());

        // Fetch history
        mockMvc.perform(get("/api/v1/disease/history")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", not(empty())))
                .andExpect(jsonPath("$.data[0].cropName", is("Cotton")));
    }

    @Test
    @DisplayName("Farmer can get detection details by ID")
    void testGetDetectionById() throws Exception {
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "leaf_detail.jpg", "image/jpeg", "bytes".getBytes());

        String responseJson = mockMvc.perform(multipart("/api/v1/disease/detect")
                        .file(imageFile)
                        .param("cropName", "Rice")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Extract ID
        com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseJson);
        long id = root.path("data").path("id").asLong();

        mockMvc.perform(get("/api/v1/disease/" + id)
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is((int) id)))
                .andExpect(jsonPath("$.data.cropName", is("Rice")));
    }

    @Test
    @DisplayName("Farmer can delete their disease detection scan")
    void testDeleteDetection() throws Exception {
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "leaf_to_delete.jpg", "image/jpeg", "bytes".getBytes());

        String responseJson = mockMvc.perform(multipart("/api/v1/disease/detect")
                        .file(imageFile)
                        .param("cropName", "Wheat")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseJson);
        long id = root.path("data").path("id").asLong();

        mockMvc.perform(delete("/api/v1/disease/" + id)
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Verify it no longer exists
        mockMvc.perform(get("/api/v1/disease/" + id)
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Serve uploaded disease image publicly/inline")
    void testServeDiseaseImage() throws Exception {
        MockMultipartFile imageFile = new MockMultipartFile(
                "image", "serve_leaf.jpg", "image/jpeg", "test-image-content".getBytes());

        String responseJson = mockMvc.perform(multipart("/api/v1/disease/detect")
                        .file(imageFile)
                        .param("cropName", "Grapes")
                        .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(responseJson);
        String fileName = root.path("data").path("imageFileName").asText();

        mockMvc.perform(get("/api/v1/disease/images/" + fileName))
                .andExpect(status().isOk())
                .andExpect(header().exists("Content-Disposition"));
    }
}
