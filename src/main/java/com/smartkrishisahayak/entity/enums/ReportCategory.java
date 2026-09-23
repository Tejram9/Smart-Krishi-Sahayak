package com.smartkrishisahayak.entity.enums;

public enum ReportCategory {
    TECHNICAL_ISSUE("Technical Issue"),
    SERVICE_ISSUE("Service Issue"),
    INCORRECT_INFORMATION("Incorrect Information"),
    AGRICULTURE_DISEASE("Agriculture/Disease Related"),
    OTHER("Other");

    private final String displayName;

    ReportCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
