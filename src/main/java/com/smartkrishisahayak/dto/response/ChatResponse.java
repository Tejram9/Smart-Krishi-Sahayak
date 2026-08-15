package com.smartkrishisahayak.dto.response;

import java.time.LocalDateTime;

public class ChatResponse {

    private Long sessionId;
    private ChatMessageResponse userMessage;
    private ChatMessageResponse aiMessage;
    private LocalDateTime timestamp;

    public ChatResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatResponse(Long sessionId, ChatMessageResponse userMessage, ChatMessageResponse aiMessage) {
        this.sessionId = sessionId;
        this.userMessage = userMessage;
        this.aiMessage = aiMessage;
        this.timestamp = LocalDateTime.now();
    }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public ChatMessageResponse getUserMessage() { return userMessage; }
    public void setUserMessage(ChatMessageResponse userMessage) { this.userMessage = userMessage; }
    public ChatMessageResponse getAiMessage() { return aiMessage; }
    public void setAiMessage(ChatMessageResponse aiMessage) { this.aiMessage = aiMessage; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
