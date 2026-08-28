package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.DiseaseDetectionResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DiseaseDetectionService {

    /**
     * Process leaf image upload, perform disease diagnosis, persist the result, and return response.
     */
    DiseaseDetectionResponse detectDisease(Long userId, MultipartFile imageFile, String cropName, String notes);

    /**
     * Retrieve all past disease detection scans for a given farmer.
     */
    List<DiseaseDetectionResponse> getFarmerDetectionHistory(Long userId);

    /**
     * Get details of a single detection scan by ID.
     */
    DiseaseDetectionResponse getDetectionById(Long id, Long userId, boolean isAdmin);

    /**
     * Delete a detection scan by ID.
     */
    void deleteDetection(Long id, Long userId, boolean isAdmin);

    /**
     * Load image file as a Resource for display.
     */
    Resource getImageAsResource(String fileName);

    /**
     * Total disease detections count across system.
     */
    long getTotalDetectionsCount();
}
