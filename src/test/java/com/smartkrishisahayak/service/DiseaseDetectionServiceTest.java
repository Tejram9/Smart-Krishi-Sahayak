package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.DiseaseDetectionResponse;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.exception.BadRequestException;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.DiseaseDetectionRepository;
import com.smartkrishisahayak.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DiseaseDetectionServiceTest {

    @Autowired
    private DiseaseDetectionService diseaseDetectionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiseaseDetectionRepository diseaseDetectionRepository;

    private User farmer;
    private User otherFarmer;

    @BeforeEach
    void setUp() {
        farmer = userRepository.findByMobileNumber("9876543210").orElseGet(() -> {
            User u = new User("Ramesh Patil", "9876543210", "hash123", PreferredLanguage.MR, UserRole.ROLE_FARMER);
            u.setEmail("ramesh.test@example.com");
            return userRepository.save(u);
        });

        otherFarmer = userRepository.findByMobileNumber("9876543211").orElseGet(() -> {
            User u = new User("Suresh Pawar", "9876543211", "hash456", PreferredLanguage.HI, UserRole.ROLE_FARMER);
            u.setEmail("suresh.test@example.com");
            return userRepository.save(u);
        });
    }

    @Test
    @DisplayName("Successfully detect disease for Tomato leaf image")
    void testDetectTomatoDisease() {
        MockMultipartFile file = new MockMultipartFile(
                "image", "tomato_leaf.jpg", "image/jpeg", "dummy-leaf-image-content".getBytes());

        DiseaseDetectionResponse response = diseaseDetectionService.detectDisease(
                farmer.getId(), file, "Tomato", "yellow ring spots");

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("Tomato", response.getCropName());
        assertTrue(response.getDiseaseName().contains("Tomato"));
        assertTrue(response.getConfidence() >= 80.0);
        assertNotNull(response.getSeverity());
        assertNotNull(response.getSymptoms());
        assertNotNull(response.getOrganicRemedies());
        assertNotNull(response.getChemicalRemedies());
        assertNotNull(response.getPreventiveMeasures());
        assertNotNull(response.getImageUrl());
        assertTrue(response.getImageUrl().startsWith("/api/v1/disease/images/"));
    }

    @Test
    @DisplayName("Successfully detect disease for Cotton and Rice crops")
    void testDetectCottonAndRiceDisease() {
        MockMultipartFile cottonFile = new MockMultipartFile(
                "image", "cotton_spot.png", "image/png", "cotton-image-data".getBytes());
        DiseaseDetectionResponse cottonRes = diseaseDetectionService.detectDisease(
                farmer.getId(), cottonFile, "Cotton", "angular spots");
        assertTrue(cottonRes.getDiseaseName().contains("Cotton"));

        MockMultipartFile riceFile = new MockMultipartFile(
                "image", "rice_leaf.jpg", "image/jpeg", "rice-image-data".getBytes());
        DiseaseDetectionResponse riceRes = diseaseDetectionService.detectDisease(
                farmer.getId(), riceFile, "Rice", "spindle lesions");
        assertTrue(riceRes.getDiseaseName().contains("Rice"));
    }

    @Test
    @DisplayName("Reject empty or invalid file formats")
    void testValidationErrors() {
        // Empty file
        MockMultipartFile emptyFile = new MockMultipartFile("image", "empty.jpg", "image/jpeg", new byte[0]);
        assertThrows(BadRequestException.class, () ->
                diseaseDetectionService.detectDisease(farmer.getId(), emptyFile, "Tomato", ""));

        // Unsupported extension (.txt)
        MockMultipartFile txtFile = new MockMultipartFile("image", "test.txt", "text/plain", "hello".getBytes());
        assertThrows(BadRequestException.class, () ->
                diseaseDetectionService.detectDisease(farmer.getId(), txtFile, "Tomato", ""));
    }

    @Test
    @DisplayName("Fetch farmer detection history in descending order")
    void testGetFarmerDetectionHistory() {
        MockMultipartFile file1 = new MockMultipartFile("image", "scan1.jpg", "image/jpeg", "image-bytes-1".getBytes());
        MockMultipartFile file2 = new MockMultipartFile("image", "scan2.jpg", "image/jpeg", "image-bytes-2".getBytes());

        diseaseDetectionService.detectDisease(farmer.getId(), file1, "Wheat", "yellow rust");
        diseaseDetectionService.detectDisease(farmer.getId(), file2, "Potato", "blight spots");

        List<DiseaseDetectionResponse> history = diseaseDetectionService.getFarmerDetectionHistory(farmer.getId());
        assertNotNull(history);
        assertTrue(history.size() >= 2);
    }

    @Test
    @DisplayName("Access control: Farmers cannot access other farmer's detection details unless Admin")
    void testAccessControlOnDetails() {
        MockMultipartFile file = new MockMultipartFile("image", "scan.jpg", "image/jpeg", "test-bytes".getBytes());
        DiseaseDetectionResponse res = diseaseDetectionService.detectDisease(farmer.getId(), file, "Grapes", "downy mildew");

        // Same farmer can access
        DiseaseDetectionResponse fetched = diseaseDetectionService.getDetectionById(res.getId(), farmer.getId(), false);
        assertEquals(res.getId(), fetched.getId());

        // Admin can access
        DiseaseDetectionResponse adminFetched = diseaseDetectionService.getDetectionById(res.getId(), null, true);
        assertEquals(res.getId(), adminFetched.getId());

        // Other farmer is denied
        assertThrows(AccessDeniedException.class, () ->
                diseaseDetectionService.getDetectionById(res.getId(), otherFarmer.getId(), false));
    }

    @Test
    @DisplayName("Delete detection scan record")
    void testDeleteDetection() {
        MockMultipartFile file = new MockMultipartFile("image", "scan_del.jpg", "image/jpeg", "test-bytes".getBytes());
        DiseaseDetectionResponse res = diseaseDetectionService.detectDisease(farmer.getId(), file, "Soybean", "rust");

        diseaseDetectionService.deleteDetection(res.getId(), farmer.getId(), false);

        assertThrows(ResourceNotFoundException.class, () ->
                diseaseDetectionService.getDetectionById(res.getId(), farmer.getId(), false));
    }

    @Test
    @DisplayName("Get image as resource")
    void testGetImageAsResource() {
        MockMultipartFile file = new MockMultipartFile("image", "sample_leaf.jpg", "image/jpeg", "leaf-data".getBytes());
        DiseaseDetectionResponse res = diseaseDetectionService.detectDisease(farmer.getId(), file, "Tomato", "");

        Resource resource = diseaseDetectionService.getImageAsResource(res.getImageFileName());
        assertNotNull(resource);
        assertTrue(resource.exists());
    }
}
