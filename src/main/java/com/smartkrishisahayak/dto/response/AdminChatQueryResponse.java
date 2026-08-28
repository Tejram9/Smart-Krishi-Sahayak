package com.smartkrishisahayak.dto.response;

import java.time.LocalDateTime;

public class AdminChatQueryResponse {

    private Long messageId;
    private Long sessionId;
    private Long userId;
    private String farmerName;
    private String farmerMobile;
    private String queryText;
    private String aiResponseText;
    private String language;
    private LocalDateTime timestamp;

    public AdminChatQueryResponse() {}

    public AdminChatQueryResponse(Long messageId, Long sessionId, Long userId, String farmerName,
                                  String farmerMobile, String queryText, String aiResponseText,
                                  String language, LocalDateTime timestamp) {
        this.messageId = messageId;
        this.sessionId = sessionId;
        this.userId = userId;
        this.farmerName = farmerName;
        this.farmerMobile = farmerMobile;
        this.queryText = queryText;
        this.aiResponseText = aiResponseText;
        this.language = language;
        this.timestamp = timestamp;
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmerMobile() {
        return farmerMobile;
    }

    public void setFarmerMobile(String farmerMobile) {
        this.farmerMobile = farmerMobile;
    }

    public String getQueryText() {
        return queryText;
    }

    public void setQueryText(String queryText) {
        this.queryText = queryText;
    }

    public String getAiResponseText() {
        return aiResponseText;
    }

    public void setAiResponseText(String aiResponseText) {
        this.aiResponseText = aiResponseText;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
