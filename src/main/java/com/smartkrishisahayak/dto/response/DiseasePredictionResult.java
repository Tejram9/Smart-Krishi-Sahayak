package com.smartkrishisahayak.dto.response;

public class DiseasePredictionResult {

    private String diseaseName;
    private String pathogen;
    private double confidence;
    private String severity;
    private String symptoms;
    private String organicRemedies;
    private String chemicalRemedies;
    private String preventiveMeasures;
    private String providerName;

    public DiseasePredictionResult() {
    }

    public DiseasePredictionResult(String diseaseName, String pathogen, double confidence, String severity,
                                   String symptoms, String organicRemedies, String chemicalRemedies,
                                   String preventiveMeasures, String providerName) {
        this.diseaseName = diseaseName;
        this.pathogen = pathogen;
        this.confidence = confidence;
        this.severity = severity;
        this.symptoms = symptoms;
        this.organicRemedies = organicRemedies;
        this.chemicalRemedies = chemicalRemedies;
        this.preventiveMeasures = preventiveMeasures;
        this.providerName = providerName;
    }

    // Getters and Setters
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

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
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

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }
}
