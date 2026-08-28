package com.smartkrishisahayak.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CropRecommendationRequest {

    @NotBlank(message = "Season is required (e.g. Kharif, Rabi, Zaid)")
    private String season;

    @NotBlank(message = "Soil type is required (e.g. Black Soil, Sandy Loam, Red Soil)")
    private String soilType;

    private String waterAvailability; // High, Medium, Low, Rainfed
    private String district;
    private String language; // EN, MR, HI

    public CropRecommendationRequest() {}

    public CropRecommendationRequest(String season, String soilType, String waterAvailability, String district, String language) {
        this.season = season;
        this.soilType = soilType;
        this.waterAvailability = waterAvailability;
        this.district = district;
        this.language = language;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public String getWaterAvailability() {
        return waterAvailability;
    }

    public void setWaterAvailability(String waterAvailability) {
        this.waterAvailability = waterAvailability;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
