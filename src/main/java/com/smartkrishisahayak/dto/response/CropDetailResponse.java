package com.smartkrishisahayak.dto.response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CropDetailResponse {

    private Long id;
    private String nameEn;
    private String nameMr;
    private String nameHi;
    private String category;
    private String suitableSeason;
    private String soilRequirements;
    private String waterRequirement;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AgricultureContentResponse> verifiedContents = new ArrayList<>();

    public CropDetailResponse() {
    }

    public CropDetailResponse(Long id, String nameEn, String nameMr, String nameHi, String category,
                              String suitableSeason, String soilRequirements, String waterRequirement,
                              String description, LocalDateTime createdAt, LocalDateTime updatedAt,
                              List<AgricultureContentResponse> verifiedContents) {
        this.id = id;
        this.nameEn = nameEn;
        this.nameMr = nameMr;
        this.nameHi = nameHi;
        this.category = category;
        this.suitableSeason = suitableSeason;
        this.soilRequirements = soilRequirements;
        this.waterRequirement = waterRequirement;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.verifiedContents = verifiedContents != null ? verifiedContents : new ArrayList<>();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<AgricultureContentResponse> getVerifiedContents() {
        return verifiedContents;
    }

    public void setVerifiedContents(List<AgricultureContentResponse> verifiedContents) {
        this.verifiedContents = verifiedContents;
    }
}
