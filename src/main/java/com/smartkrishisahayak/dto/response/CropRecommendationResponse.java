package com.smartkrishisahayak.dto.response;

public class CropRecommendationResponse {

    private Long cropId;
    private String nameEn;
    private String nameMr;
    private String nameHi;
    private String category;
    private String suitableSeason;
    private String soilRequirements;
    private String waterRequirement;
    private int matchPercentage;
    private String recommendationReason;

    public CropRecommendationResponse() {}

    public CropRecommendationResponse(Long cropId, String nameEn, String nameMr, String nameHi,
                                      String category, String suitableSeason, String soilRequirements,
                                      String waterRequirement, int matchPercentage, String recommendationReason) {
        this.cropId = cropId;
        this.nameEn = nameEn;
        this.nameMr = nameMr;
        this.nameHi = nameHi;
        this.category = category;
        this.suitableSeason = suitableSeason;
        this.soilRequirements = soilRequirements;
        this.waterRequirement = waterRequirement;
        this.matchPercentage = matchPercentage;
        this.recommendationReason = recommendationReason;
    }

    public Long getCropId() {
        return cropId;
    }

    public void setCropId(Long cropId) {
        this.cropId = cropId;
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

    public int getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(int matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public String getRecommendationReason() {
        return recommendationReason;
    }

    public void setRecommendationReason(String recommendationReason) {
        this.recommendationReason = recommendationReason;
    }
}
