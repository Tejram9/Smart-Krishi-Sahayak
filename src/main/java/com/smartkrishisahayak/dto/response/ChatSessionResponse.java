package com.smartkrishisahayak.dto.response;

import com.smartkrishisahayak.entity.enums.PreferredLanguage;

import java.time.LocalDateTime;

public class ChatSessionResponse {

    private Long id;
    private String sessionTitle;
    private PreferredLanguage language;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int messageCount;

    public ChatSessionResponse() {
    }

    public ChatSessionResponse(Long id, String sessionTitle, PreferredLanguage language,
                                LocalDateTime createdAt, LocalDateTime updatedAt, int messageCount) {
        this.id = id;
        this.sessionTitle = sessionTitle;
        this.language = language;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.messageCount = messageCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }
    public PreferredLanguage getLanguage() { return language; }
    public void setLanguage(PreferredLanguage language) { this.language = language; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public int getMessageCount() { return messageCount; }
    public void setMessageCount(int messageCount) { this.messageCount = messageCount; }
}
