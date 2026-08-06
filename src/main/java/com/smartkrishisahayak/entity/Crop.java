package com.smartkrishisahayak.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "crops")
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    @Column(name = "name_mr", nullable = false, length = 100)
    private String nameMr;

    @Column(name = "name_hi", nullable = false, length = 100)
    private String nameHi;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "suitable_season", nullable = false, length = 50)
    private String suitableSeason;

    @Column(name = "soil_requirements", length = 150)
    private String soilRequirements;

    @Column(name = "water_requirement", length = 100)
    private String waterRequirement;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "crop", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<VerifiedAgricultureContent> verifiedContents = new ArrayList<>();

    public Crop() {
    }

    public Crop(String nameEn, String nameMr, String nameHi, String category, String suitableSeason, String soilRequirements, String waterRequirement, String description) {
        this.nameEn = nameEn;
        this.nameMr = nameMr;
        this.nameHi = nameHi;
        this.category = category;
        this.suitableSeason = suitableSeason;
        this.soilRequirements = soilRequirements;
        this.waterRequirement = waterRequirement;
        this.description = description;
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

    public List<VerifiedAgricultureContent> getVerifiedContents() {
        return verifiedContents;
    }

    public void setVerifiedContents(List<VerifiedAgricultureContent> verifiedContents) {
        this.verifiedContents = verifiedContents;
    }
}
