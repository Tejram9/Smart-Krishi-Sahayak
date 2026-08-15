package com.smartkrishisahayak.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Request payload for updating the authenticated farmer's profile and farm details.
 */
public class FarmerProfileUpdateRequest {

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email address cannot exceed 100 characters")
    private String email;

    @Size(max = 10, message = "Language code cannot exceed 10 characters")
    private String preferredLanguage;

    @Size(max = 50, message = "State cannot exceed 50 characters")
    private String state;

    @Size(max = 50, message = "District cannot exceed 50 characters")
    private String district;

    @Size(max = 50, message = "Taluka cannot exceed 50 characters")
    private String taluka;

    @Size(max = 50, message = "Village cannot exceed 50 characters")
    private String village;

    @DecimalMin(value = "0.0", inclusive = true, message = "Land size cannot be negative")
    @DecimalMax(value = "10000.0", inclusive = true, message = "Land size exceeds reasonable maximum limit")
    private BigDecimal landSizeAcres;

    @Size(max = 255, message = "Primary crops cannot exceed 255 characters")
    private String primaryCrops;

    @Size(max = 50, message = "Soil type cannot exceed 50 characters")
    private String soilType;

    public FarmerProfileUpdateRequest() {
    }

    public FarmerProfileUpdateRequest(String fullName, String email, String preferredLanguage,
                                      String state, String district, String taluka, String village,
                                      BigDecimal landSizeAcres, String primaryCrops, String soilType) {
        this.fullName = fullName;
        this.email = email;
        this.preferredLanguage = preferredLanguage;
        this.state = state;
        this.district = district;
        this.taluka = taluka;
        this.village = village;
        this.landSizeAcres = landSizeAcres;
        this.primaryCrops = primaryCrops;
        this.soilType = soilType;
    }

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getTaluka() {
        return taluka;
    }

    public void setTaluka(String taluka) {
        this.taluka = taluka;
    }

    public String getVillage() {
        return village;
    }

    public void setVillage(String village) {
        this.village = village;
    }

    public BigDecimal getLandSizeAcres() {
        return landSizeAcres;
    }

    public void setLandSizeAcres(BigDecimal landSizeAcres) {
        this.landSizeAcres = landSizeAcres;
    }

    public String getPrimaryCrops() {
        return primaryCrops;
    }

    public void setPrimaryCrops(String primaryCrops) {
        this.primaryCrops = primaryCrops;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }
}
