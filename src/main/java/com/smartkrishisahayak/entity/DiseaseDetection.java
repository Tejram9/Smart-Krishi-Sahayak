package com.smartkrishisahayak.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "disease_detections")
public class DiseaseDetection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "crop_name", nullable = false, length = 100)
    private String cropName;

    @Column(name = "image_file_name", nullable = false, length = 255)
    private String imageFileName;

    @Column(name = "original_file_name", length = 255)
    private String originalFileName;

    @Column(name = "image_path", nullable = false, length = 255)
    private String imagePath;

    @Column(name = "disease_name", nullable = false, length = 150)
    private String diseaseName;

    @Column(name = "pathogen", length = 150)
    private String pathogen;

    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "severity", nullable = false, length = 50)
    private String severity;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "organic_remedies", columnDefinition = "TEXT")
    private String organicRemedies;

    @Column(name = "chemical_remedies", columnDefinition = "TEXT")
    private String chemicalRemedies;

    @Column(name = "preventive_measures", columnDefinition = "TEXT")
    private String preventiveMeasures;

    @Column(name = "prediction_provider", length = 150)
    private String predictionProvider;

    @CreationTimestamp
    @Column(name = "detected_at", nullable = false, updatable = false)
    private LocalDateTime detectedAt;

    public DiseaseDetection() {
    }

    public DiseaseDetection(User user, String cropName, String imageFileName, String imagePath,
                            String diseaseName, String pathogen, Double confidence, String severity,
                            String symptoms, String organicRemedies, String chemicalRemedies,
                            String preventiveMeasures) {
        this(user, cropName, imageFileName, imageFileName, imagePath, diseaseName, pathogen, confidence,
                severity, symptoms, organicRemedies, chemicalRemedies, preventiveMeasures, "Rule-Based Provider");
    }

    public DiseaseDetection(User user, String cropName, String imageFileName, String originalFileName,
                            String imagePath, String diseaseName, String pathogen, Double confidence,
                            String severity, String symptoms, String organicRemedies, String chemicalRemedies,
                            String preventiveMeasures, String predictionProvider) {
        this.user = user;
        this.cropName = cropName;
        this.imageFileName = imageFileName;
        this.originalFileName = originalFileName;
        this.imagePath = imagePath;
        this.diseaseName = diseaseName;
        this.pathogen = pathogen;
        this.confidence = confidence;
        this.severity = severity;
        this.symptoms = symptoms;
        this.organicRemedies = organicRemedies;
        this.chemicalRemedies = chemicalRemedies;
        this.preventiveMeasures = preventiveMeasures;
        this.predictionProvider = predictionProvider;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
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
