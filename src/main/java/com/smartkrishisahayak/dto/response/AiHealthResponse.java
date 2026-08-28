package com.smartkrishisahayak.dto.response;

public class AiHealthResponse {

    private String provider;
    private String model;
    private boolean apiKeyConfigured;
    private String status;

    public AiHealthResponse() {}

    public AiHealthResponse(String provider, String model, boolean apiKeyConfigured, String status) {
        this.provider = provider;
        this.model = model;
        this.apiKeyConfigured = apiKeyConfigured;
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public boolean isApiKeyConfigured() {
        return apiKeyConfigured;
    }

    public void setApiKeyConfigured(boolean apiKeyConfigured) {
        this.apiKeyConfigured = apiKeyConfigured;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
