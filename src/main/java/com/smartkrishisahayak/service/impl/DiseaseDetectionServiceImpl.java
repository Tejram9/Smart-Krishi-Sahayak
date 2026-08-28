package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.response.DiseaseDetectionResponse;
import com.smartkrishisahayak.dto.response.DiseasePredictionResult;
import com.smartkrishisahayak.entity.DiseaseDetection;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.exception.BadRequestException;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.DiseaseDetectionRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.service.DiseaseDetectionService;
import com.smartkrishisahayak.service.DiseasePredictionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class DiseaseDetectionServiceImpl implements DiseaseDetectionService {

    private static final Logger log = LoggerFactory.getLogger(DiseaseDetectionServiceImpl.class);

    private final DiseaseDetectionRepository diseaseDetectionRepository;
    private final UserRepository userRepository;
    private final DiseasePredictionService diseasePredictionService;
    private final Path uploadStorageLocation;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/pjpeg"
    );
    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    @Autowired
    public DiseaseDetectionServiceImpl(DiseaseDetectionRepository diseaseDetectionRepository,
                                       UserRepository userRepository,
                                       DiseasePredictionService diseasePredictionService) {
        this.diseaseDetectionRepository = diseaseDetectionRepository;
        this.userRepository = userRepository;
        this.diseasePredictionService = diseasePredictionService;
        this.uploadStorageLocation = Paths.get("uploads", "disease-scans").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadStorageLocation);
        } catch (IOException ex) {
            log.error("Could not create upload directory for disease scans", ex);
        }
    }

    @Override
    @Transactional
    public DiseaseDetectionResponse detectDisease(Long userId, MultipartFile imageFile, String cropName, String notes) {
        if (userId == null) {
            throw new BadRequestException("User ID is required for disease detection.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer user not found with ID: " + userId));

        // 1. Validate Uploaded Leaf Image
        validateImageFile(imageFile);

        // 2. Read Image Binary Data
        byte[] imageBytes;
        try {
            imageBytes = imageFile.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("Failed to read uploaded leaf image content: " + ex.getMessage());
        }

        // 3. Store Image File Securely (prevent path traversal with clean name and server UUID)
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(imageFile.getOriginalFilename()));
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFileName = "leaf_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "." + fileExtension;
        Path targetPath = this.uploadStorageLocation.resolve(uniqueFileName);

        try {
            Files.copy(imageFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            log.error("Failed to store image file: {}", uniqueFileName, ex);
            throw new BadRequestException("Failed to store leaf image on server: " + ex.getMessage());
        }

        // 4. Process Disease Prediction via Pluggable Prediction Provider
        String normalizedCrop = (cropName != null && !cropName.trim().isEmpty()) ? cropName.trim() : "General Crop";
        DiseasePredictionResult prediction = diseasePredictionService.predictDisease(
                normalizedCrop, originalFilename, notes, imageBytes);

        // 5. Persist Detection Record to Database
        DiseaseDetection detection = new DiseaseDetection(
                user,
                normalizedCrop,
                uniqueFileName,
                originalFilename,
                targetPath.toString(),
                prediction.getDiseaseName(),
                prediction.getPathogen(),
                prediction.getConfidence(),
                prediction.getSeverity(),
                prediction.getSymptoms(),
                prediction.getOrganicRemedies(),
                prediction.getChemicalRemedies(),
                prediction.getPreventiveMeasures(),
                prediction.getProviderName()
        );

        DiseaseDetection saved = diseaseDetectionRepository.save(detection);
        log.info("Diagnosed and persisted disease scan ID={} for user ID={}, crop='{}', disease='{}' [provider='{}']",
                saved.getId(), userId, normalizedCrop, prediction.getDiseaseName(), prediction.getProviderName());

        return DiseaseDetectionResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiseaseDetectionResponse> getFarmerDetectionHistory(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        List<DiseaseDetection> list = diseaseDetectionRepository.findByUserIdOrderByDetectedAtDesc(userId);
        return list.stream().map(DiseaseDetectionResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DiseaseDetectionResponse getDetectionById(Long id, Long userId, boolean isAdmin) {
        DiseaseDetection detection = diseaseDetectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disease detection record not found with ID: " + id));

        // Strict Tenant Ownership Check: Non-admin users can ONLY access their own records
        if (!isAdmin && (userId == null || !detection.getUser().getId().equals(userId))) {
            throw new AccessDeniedException("You are not authorized to view this disease detection record.");
        }

        return DiseaseDetectionResponse.fromEntity(detection);
    }

    @Override
    @Transactional
    public void deleteDetection(Long id, Long userId, boolean isAdmin) {
        DiseaseDetection detection = diseaseDetectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disease detection record not found with ID: " + id));

        // Strict Tenant Ownership Check: Non-admin users can ONLY delete their own records
        if (!isAdmin && (userId == null || !detection.getUser().getId().equals(userId))) {
            throw new AccessDeniedException("You are not authorized to delete this disease detection record.");
        }

        // Delete physical file if exists
        try {
            Path filePath = this.uploadStorageLocation.resolve(detection.getImageFileName()).normalize();
            Files.deleteIfExists(filePath);
        } catch (Exception ex) {
            log.warn("Could not delete physical image file: {}", detection.getImageFileName(), ex);
        }

        diseaseDetectionRepository.delete(detection);
        log.info("Deleted disease detection record ID={} by user ID={}", id, userId);
    }

    @Override
    public Resource getImageAsResource(String fileName) {
        try {
            // Prevent path traversal
            if (fileName == null || fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
                throw new BadRequestException("Invalid image file name.");
            }
            Path filePath = this.uploadStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Image file not found or unreadable: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Invalid image file path: " + fileName);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalDetectionsCount() {
        return diseaseDetectionRepository.count();
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid leaf image to upload.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Leaf image size exceeds maximum permitted limit (10MB).");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            throw new BadRequestException("Invalid leaf image filename: path traversal characters detected.");
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("Unsupported image format. Allowed formats are: JPG, JPEG, PNG, WEBP.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid content type for image: " + contentType);
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "jpg";
    }
}
