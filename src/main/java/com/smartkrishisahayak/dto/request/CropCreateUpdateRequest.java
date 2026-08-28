package com.smartkrishisahayak.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CropCreateUpdateRequest {

    @NotBlank(message = "English crop name is required")
    @Size(max = 100, message = "English crop name must not exceed 100 characters")
    private String nameEn;

    @NotBlank(message = "Marathi crop name is required")
    @Size(max = 100, message = "Marathi crop name must not exceed 100 characters")
    private String nameMr;

    @NotBlank(message = "Hindi crop name is required")
    @Size(max = 100, message = "Hindi crop name must not exceed 100 characters")
    private String nameHi;

    @NotBlank(message = "Crop category is required")
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @NotBlank(message = "Suitable season is required")
    @Size(max = 50, message = "Suitable season must not exceed 50 characters")
    private String suitableSeason;

    @Size(max = 255, message = "Soil requirements must not exceed 255 characters")
    private String soilRequirements;

    @Size(max = 100, message = "Water requirement must not exceed 100 characters")
    private String waterRequirement;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    public CropCreateUpdateRequest() {}

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public String getNameMr() {
        return nameMr;
    }

    public void setNameMr(String nameMr) {
        this.nameMr = nameMr;
    }

    public String getNameHi() {
        return nameHi;
    }

    public void setNameHi(String nameHi) {
        this.nameHi = nameHi;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSuitableSeason() {
        return suitableSeason;
    }

    public void setSuitableSeason(String suitableSeason) {
        this.suitableSeason = suitableSeason;
    }

    public String getSoilRequirements() {
        return soilRequirements;
    }

    public void setSoilRequirements(String soilRequirements) {
        this.soilRequirements = soilRequirements;
    }

    public String getWaterRequirement() {
        return waterRequirement;
    }

    public void setWaterRequirement(String waterRequirement) {
        this.waterRequirement = waterRequirement;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
