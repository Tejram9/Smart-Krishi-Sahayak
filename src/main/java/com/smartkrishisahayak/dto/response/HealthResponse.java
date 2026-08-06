package com.smartkrishisahayak.dto.response;

import java.util.List;

public class HealthResponse {

    private String status;
    private String applicationName;
    private String version;
    private String databaseStatus;
    private List<String> supportedLanguages;

    public HealthResponse() {
    }

    public HealthResponse(String status, String applicationName, String version, String databaseStatus, List<String> supportedLanguages) {
        this.status = status;
        this.applicationName = applicationName;
        this.version = version;
        this.databaseStatus = databaseStatus;
        this.supportedLanguages = supportedLanguages;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApplicationName() {
        return applicationName;
    }

    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getDatabaseStatus() {
        return databaseStatus;
    }

    public void setDatabaseStatus(String databaseStatus) {
        this.databaseStatus = databaseStatus;
    }

    public List<String> getSupportedLanguages() {
        return supportedLanguages;
    }

    public void setSupportedLanguages(List<String> supportedLanguages) {
        this.supportedLanguages = supportedLanguages;
    }
}
