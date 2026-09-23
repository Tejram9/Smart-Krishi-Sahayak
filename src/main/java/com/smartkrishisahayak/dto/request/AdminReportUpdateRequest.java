package com.smartkrishisahayak.dto.request;

import com.smartkrishisahayak.entity.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;

public class AdminReportUpdateRequest {

    @NotNull(message = "Report status is required")
    private ReportStatus status;

    private String adminResponse;

    public AdminReportUpdateRequest() {
    }

    public AdminReportUpdateRequest(ReportStatus status, String adminResponse) {
        this.status = status;
        this.adminResponse = adminResponse;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }
}
