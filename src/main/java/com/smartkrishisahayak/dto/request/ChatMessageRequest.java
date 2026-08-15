package com.smartkrishisahayak.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatMessageRequest {

    @NotBlank(message = "Message must not be blank")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;

    /**
     * Optional preferred language for this message (EN, MR, HI).
     * If omitted, the session language will be used as fallback.
     */
    private String language;

    public ChatMessageRequest() {
    }

    public ChatMessageRequest(String message, String language) {
        this.message = message;
        this.language = language;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
