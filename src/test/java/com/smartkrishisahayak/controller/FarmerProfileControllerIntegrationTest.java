package com.smartkrishisahayak.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.request.FarmerProfileUpdateRequest;
import com.smartkrishisahayak.entity.FarmerProfile;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.*;
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

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FarmerProfileControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private FarmerProfileRepository farmerProfileRepository;
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
        // FK-safe deletion order
        contentRepository.deleteAll();
        cropRepository.deleteAll();
        chatMessageRepository.deleteAll();
        chatSessionRepository.deleteAll();
        farmerProfileRepository.deleteAll();
        userRepository.deleteAll();

        // Create Farmer A
        farmerA = new User("रमेश पाटील", "9876543210", passwordEncoder.encode("Password@123"), PreferredLanguage.MR, UserRole.ROLE_FARMER);
        farmerA.setEmail("farmer.a@example.com");
        FarmerProfile profileA = new FarmerProfile(farmerA, "Maharashtra", "Nashik", "Niphad", "Pimpalgaon", new BigDecimal("4.50"), "कापूस, सोयाबीन", "काळी कसदार");
        farmerA.setFarmerProfile(profileA);
        farmerA = userRepository.save(farmerA);
        farmerAToken = jwtService.generateTokenFromUserId(farmerA.getId(), farmerA.getRole().name(), farmerA.getMobileNumber());

        // Create Farmer B
        farmerB = new User("सुरेश शर्मा", "9876543211", passwordEncoder.encode("Password@123"), PreferredLanguage.HI, UserRole.ROLE_FARMER);
        farmerB.setEmail("farmer.b@example.com");
        FarmerProfile profileB = new FarmerProfile(farmerB, "Maharashtra", "Pune", "Haveli", "Manchar", new BigDecimal("2.00"), "गेहूं", "दोमट");
        farmerB.setFarmerProfile(profileB);
        farmerB = userRepository.save(farmerB);
        farmerBToken = jwtService.generateTokenFromUserId(farmerB.getId(), farmerB.getRole().name(), farmerB.getMobileNumber());
    }

    @Test
    @DisplayName("Test 1: Authenticated farmer can fetch own profile successfully")
    void getProfile_authenticatedFarmer_returnsProfileData() throws Exception {
        mockMvc.perform(get("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("रमेश पाटील"))
                .andExpect(jsonPath("$.data.mobileNumber").value("9876543210"))
                .andExpect(jsonPath("$.data.district").value("Nashik"))
                .andExpect(jsonPath("$.data.taluka").value("Niphad"))
                .andExpect(jsonPath("$.data.landSizeAcres").value(4.50))
                .andExpect(jsonPath("$.data.primaryCrops").value("कापूस, सोयाबीन"))
                .andExpect(jsonPath("$.data.soilType").value("काळी कसदार"));
    }

    @Test
    @DisplayName("Test 2: Authenticated farmer can update own farm details")
    void updateProfile_authenticatedFarmer_updatesSuccessfully() throws Exception {
        FarmerProfileUpdateRequest updateRequest = new FarmerProfileUpdateRequest(
                "रमेश विष्णू पाटील",
                "ramesh.updated@example.com",
                "MR",
                "Maharashtra",
                "Nashik",
                "Dindori",
                "Vani",
                new BigDecimal("6.00"),
                "द्राक्ष, टोमॅटो, कांदा",
                "तांबडी माती"
        );

        mockMvc.perform(put("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("रमेश विष्णू पाटील"))
                .andExpect(jsonPath("$.data.email").value("ramesh.updated@example.com"))
                .andExpect(jsonPath("$.data.taluka").value("Dindori"))
                .andExpect(jsonPath("$.data.village").value("Vani"))
                .andExpect(jsonPath("$.data.landSizeAcres").value(6.00))
                .andExpect(jsonPath("$.data.primaryCrops").value("द्राक्ष, टोमॅटो, कांदा"))
                .andExpect(jsonPath("$.data.soilType").value("तांबडी माती"));
    }

    @Test
    @DisplayName("Test 3: Devanagari Hindi and Marathi text persists accurately")
    void updateProfile_devanagariUnicode_persistsAccurately() throws Exception {
        FarmerProfileUpdateRequest updateRequest = new FarmerProfileUpdateRequest(
                "सुरेश कुमार शर्मा",
                "suresh.sharma@example.com",
                "HI",
                "महाराष्ट्र",
                "नागपुर",
                "काटोल",
                "ईश्वरपूर",
                new BigDecimal("3.75"),
                "संतरा, कपास, चना",
                "काली दोमट मिट्टी"
        );

        mockMvc.perform(put("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("सुरेश कुमार शर्मा"))
                .andExpect(jsonPath("$.data.district").value("नागपुर"))
                .andExpect(jsonPath("$.data.taluka").value("काटोल"))
                .andExpect(jsonPath("$.data.primaryCrops").value("संतरा, कपास, चना"))
                .andExpect(jsonPath("$.data.soilType").value("काली दोमट मिट्टी"));
    }

    @Test
    @DisplayName("Test 4: Unauthenticated request to GET /api/v1/farmer/profile is rejected with 401")
    void getProfile_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/farmer/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 5: Unauthenticated request to PUT /api/v1/farmer/profile is rejected with 401")
    void updateProfile_unauthenticated_returns401() throws Exception {
        FarmerProfileUpdateRequest updateRequest = new FarmerProfileUpdateRequest();
        updateRequest.setFullName("Test Farmer");

        mockMvc.perform(put("/api/v1/farmer/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Test 6: Negative land size is rejected with 400")
    void updateProfile_negativeLandSize_returns400() throws Exception {
        FarmerProfileUpdateRequest updateRequest = new FarmerProfileUpdateRequest();
        updateRequest.setLandSizeAcres(new BigDecimal("-2.5"));

        mockMvc.perform(put("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Test 7: Invalid email format is rejected with 400")
    void updateProfile_invalidEmail_returns400() throws Exception {
        FarmerProfileUpdateRequest updateRequest = new FarmerProfileUpdateRequest();
        updateRequest.setEmail("invalid-email-address");

        mockMvc.perform(put("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Test 8: Updating email to another user's email is rejected with 400")
    void updateProfile_duplicateEmail_returns400() throws Exception {
        FarmerProfileUpdateRequest updateRequest = new FarmerProfileUpdateRequest();
        updateRequest.setEmail("farmer.b@example.com"); // already owned by Farmer B

        mockMvc.perform(put("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("Email address is already in use")));
    }

    @Test
    @DisplayName("Test 9: Farmer A updates do not affect Farmer B profile (Isolation)")
    void profileIsolation_farmerAUpdateDoesNotAffectFarmerB() throws Exception {
        FarmerProfileUpdateRequest updateA = new FarmerProfileUpdateRequest();
        updateA.setDistrict("Satara");
        updateA.setLandSizeAcres(new BigDecimal("10.00"));

        mockMvc.perform(put("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateA)))
                .andExpect(status().isOk());

        // Verify Farmer B profile remains unchanged
        mockMvc.perform(get("/api/v1/farmer/profile")
                        .header("Authorization", "Bearer " + farmerBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.district").value("Pune"))
                .andExpect(jsonPath("$.data.landSizeAcres").value(2.00));
    }
}
