package com.smartkrishisahayak.dto.response;

import com.smartkrishisahayak.entity.enums.PreferredLanguage;

import java.time.LocalDateTime;

public class AgricultureContentResponse {

    private Long id;
    private String title;
    private String contentBody;
    private String category;
    private PreferredLanguage language;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AgricultureContentResponse() {
    }

    public AgricultureContentResponse(Long id, String title, String contentBody, String category,
                                      PreferredLanguage language, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.contentBody = contentBody;
        this.category = category;
        this.language = language;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentBody() {
        return contentBody;
    }

    public void setContentBody(String contentBody) {
        this.contentBody = contentBody;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public PreferredLanguage getLanguage() {
        return language;
    }

    public void setLanguage(PreferredLanguage language) {
        this.language = language;
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
}
