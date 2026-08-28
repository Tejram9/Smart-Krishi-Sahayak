package com.smartkrishisahayak.dto.response;

import com.smartkrishisahayak.entity.DiseaseDetection;

import java.time.LocalDateTime;

public class DiseaseDetectionResponse {

    private Long id;
    private Long userId;
    private String cropName;
    private String imageFileName;
    private String originalFileName;
    private String imageUrl;
    private String diseaseName;
    private String pathogen;
    private Double confidence;
    private String severity;
    private String symptoms;
    private String organicRemedies;
    private String chemicalRemedies;
    private String preventiveMeasures;
    private String predictionProvider;
    private LocalDateTime detectedAt;

    public DiseaseDetectionResponse() {
    }

    public static DiseaseDetectionResponse fromEntity(DiseaseDetection entity) {
        if (entity == null) {
            return null;
        }
        DiseaseDetectionResponse response = new DiseaseDetectionResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        response.setCropName(entity.getCropName());
        response.setImageFileName(entity.getImageFileName());
        response.setOriginalFileName(entity.getOriginalFileName());
        // Clean public image URL without exposing internal filesystem paths
        response.setImageUrl("/api/v1/disease/images/" + entity.getImageFileName());
        response.setDiseaseName(entity.getDiseaseName());
        response.setPathogen(entity.getPathogen());
        response.setConfidence(entity.getConfidence());
        response.setSeverity(entity.getSeverity());
        response.setSymptoms(entity.getSymptoms());
        response.setOrganicRemedies(entity.getOrganicRemedies());
        response.setChemicalRemedies(entity.getChemicalRemedies());
        response.setPreventiveMeasures(entity.getPreventiveMeasures());
        response.setPredictionProvider(entity.getPredictionProvider());
        response.setDetectedAt(entity.getDetectedAt());
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getImageFileName() {
        return imageFileName;
    }

    public void setImageFileName(String imageFileName) {
        this.imageFileName = imageFileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDiseaseName() {
        return diseaseName;
    }

    public void setDiseaseName(String diseaseName) {
        this.diseaseName = diseaseName;
    }

    public String getPathogen() {
        return pathogen;
    }

    public void setPathogen(String pathogen) {
        this.pathogen = pathogen;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getOrganicRemedies() {
        return organicRemedies;
    }

    public void setOrganicRemedies(String organicRemedies) {
        this.organicRemedies = organicRemedies;
    }

    public String getChemicalRemedies() {
        return chemicalRemedies;
    }

    public void setChemicalRemedies(String chemicalRemedies) {
        this.chemicalRemedies = chemicalRemedies;
    }

    public String getPreventiveMeasures() {
        return preventiveMeasures;
    }

    public void setPreventiveMeasures(String preventiveMeasures) {
        this.preventiveMeasures = preventiveMeasures;
    }

    public String getPredictionProvider() {
        return predictionProvider;
    }

    public void setPredictionProvider(String predictionProvider) {
        this.predictionProvider = predictionProvider;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }
}
