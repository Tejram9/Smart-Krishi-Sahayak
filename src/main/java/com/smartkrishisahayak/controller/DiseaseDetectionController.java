package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.DiseaseDetectionResponse;
import com.smartkrishisahayak.security.UserPrincipal;
import com.smartkrishisahayak.service.DiseaseDetectionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping
public class DiseaseDetectionController {

    private static final Logger log = LoggerFactory.getLogger(DiseaseDetectionController.class);

    private final DiseaseDetectionService diseaseDetectionService;

    @Autowired
    public DiseaseDetectionController(DiseaseDetectionService diseaseDetectionService) {
        this.diseaseDetectionService = diseaseDetectionService;
    }

    /**
     * Upload a leaf image and run AI plant disease diagnostic prediction.
     */
    @PostMapping(value = {"/api/v1/disease/detect", "/api/disease/detect"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DiseaseDetectionResponse>> detectDisease(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "cropName", required = false) String cropName,
            @RequestParam(value = "notes", required = false) String notes,
            @AuthenticationPrincipal UserPrincipal principal) {

        log.info("Disease detection requested by user ID={}, crop='{}', filename='{}'",
                principal.getId(), cropName, image != null ? image.getOriginalFilename() : "null");

        DiseaseDetectionResponse response = diseaseDetectionService.detectDisease(
                principal.getId(), image, cropName, notes);

        return new ResponseEntity<>(
                ApiResponse.success("Plant disease diagnosed successfully.", response),
                HttpStatus.CREATED
        );
    }

    /**
     * Get detection history for the currently logged in farmer.
     */
    @GetMapping({"/api/v1/disease/history", "/api/disease/history"})
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DiseaseDetectionResponse>>> getDetectionHistory(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<DiseaseDetectionResponse> history = diseaseDetectionService.getFarmerDetectionHistory(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Detection history retrieved successfully.", history));
    }

    /**
     * Get specific detection record by ID.
     */
    @GetMapping({"/api/v1/disease/{id}", "/api/disease/{id}"})
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DiseaseDetectionResponse>> getDetectionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        DiseaseDetectionResponse response = diseaseDetectionService.getDetectionById(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Detection details retrieved successfully.", response));
    }

    /**
     * Delete a detection record by ID.
     */
    @DeleteMapping({"/api/v1/disease/{id}", "/api/disease/{id}"})
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDetection(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        diseaseDetectionService.deleteDetection(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Disease scan record deleted successfully.", null));
    }

    /**
     * Serve uploaded disease leaf images.
     */
    @GetMapping({"/api/v1/disease/images/{fileName:.+}", "/api/disease/images/{fileName:.+}"})
    public ResponseEntity<Resource> getDiseaseImage(@PathVariable String fileName) {
        Resource resource = diseaseDetectionService.getImageAsResource(fileName);

        String contentType = "image/jpeg";
        try {
            if (resource.getFile().exists()) {
                String probed = Files.probeContentType(resource.getFile().toPath());
                if (probed != null) {
                    contentType = probed;
                }
            }
        } catch (IOException e) {
            log.debug("Could not probe content type for image {}: {}", fileName, e.getMessage());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
