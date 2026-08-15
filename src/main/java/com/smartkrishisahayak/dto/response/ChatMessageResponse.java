package com.smartkrishisahayak.dto.response;

import com.smartkrishisahayak.entity.enums.MessageSender;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;

import java.time.LocalDateTime;

public class ChatMessageResponse {

    private Long id;
    private MessageSender sender;
    private String message;
    private PreferredLanguage language;
    private LocalDateTime timestamp;

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(Long id, MessageSender sender, String message, PreferredLanguage language, LocalDateTime timestamp) {
        this.id = id;
        this.sender = sender;
        this.message = message;
        this.language = language;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public MessageSender getSender() { return sender; }
    public void setSender(MessageSender sender) { this.sender = sender; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public PreferredLanguage getLanguage() { return language; }
    public void setLanguage(PreferredLanguage language) { this.language = language; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
