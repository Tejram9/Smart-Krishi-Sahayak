package com.smartkrishisahayak.dto.response;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long id;
    private String fullName;
    private String mobileNumber;
    private String email;
    private String preferredLanguage;
    private String role;
    private boolean enabled;
    private String state;
    private String district;
    private String taluka;
    private String village;
    private Double landSizeAcres;
    private String primaryCrops;
    private String soilType;
    private LocalDateTime createdAt;

    public AdminUserResponse() {}

    public AdminUserResponse(Long id, String fullName, String mobileNumber, String email,
                             String preferredLanguage, String role, boolean enabled,
                             String state, String district, String taluka, String village,
                             Double landSizeAcres, String primaryCrops, String soilType,
                             LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.mobileNumber = mobileNumber;
        this.email = email;
        this.preferredLanguage = preferredLanguage;
        this.role = role;
        this.enabled = enabled;
        this.state = state;
        this.district = district;
        this.taluka = taluka;
        this.village = village;
        this.landSizeAcres = landSizeAcres;
        this.primaryCrops = primaryCrops;
        this.soilType = soilType;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
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

    public Double getLandSizeAcres() {
        return landSizeAcres;
    }

    public void setLandSizeAcres(Double landSizeAcres) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
