package com.smartkrishisahayak.dto.response;

import java.util.List;
import java.util.Map;

public class AdminDetailedAnalyticsResponse {

    // User Statistics
    private long totalFarmers;
    private long totalAdmins;
    private List<TimePointStat> registrationTrend;

    // Report / Complaint Statistics
    private long totalReports;
    private long pendingReports;
    private long inProgressReports;
    private long resolvedReports;
    private long rejectedReports;
    private Map<String, Long> reportsByCategory;
    private Map<String, Long> reportsByStatus;

    // Login Activity Statistics
    private long todayLogins;
    private long activeSessions;
    private List<TimePointStat> loginTrend;

    // Existing System Metrics
    private long totalQueriesAnswered;
    private long totalCropsManaged;
    private long totalAdvisoriesPublished;
    private Map<String, Long> languageDistribution;

    public AdminDetailedAnalyticsResponse() {
    }

    public static class TimePointStat {
        private String date;
        private long count;

        public TimePointStat() {
        }

        public TimePointStat(String date, long count) {
            this.date = date;
            this.count = count;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }

    // Getters and Setters
    public long getTotalFarmers() {
        return totalFarmers;
    }

    public void setTotalFarmers(long totalFarmers) {
        this.totalFarmers = totalFarmers;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public List<TimePointStat> getRegistrationTrend() {
        return registrationTrend;
    }

    public void setRegistrationTrend(List<TimePointStat> registrationTrend) {
        this.registrationTrend = registrationTrend;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public long getInProgressReports() {
        return inProgressReports;
    }

    public void setInProgressReports(long inProgressReports) {
        this.inProgressReports = inProgressReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }

    public void setResolvedReports(long resolvedReports) {
        this.resolvedReports = resolvedReports;
    }

    public long getRejectedReports() {
        return rejectedReports;
    }

    public void setRejectedReports(long rejectedReports) {
        this.rejectedReports = rejectedReports;
    }

    public Map<String, Long> getReportsByCategory() {
        return reportsByCategory;
    }

    public void setReportsByCategory(Map<String, Long> reportsByCategory) {
        this.reportsByCategory = reportsByCategory;
    }

    public Map<String, Long> getReportsByStatus() {
        return reportsByStatus;
    }

    public void setReportsByStatus(Map<String, Long> reportsByStatus) {
        this.reportsByStatus = reportsByStatus;
    }

    public long getTodayLogins() {
        return todayLogins;
    }

    public void setTodayLogins(long todayLogins) {
        this.todayLogins = todayLogins;
    }

    public long getActiveSessions() {
        return activeSessions;
    }

    public void setActiveSessions(long activeSessions) {
        this.activeSessions = activeSessions;
    }

    public List<TimePointStat> getLoginTrend() {
        return loginTrend;
    }

    public void setLoginTrend(List<TimePointStat> loginTrend) {
        this.loginTrend = loginTrend;
    }

    public long getTotalQueriesAnswered() {
        return totalQueriesAnswered;
    }

    public void setTotalQueriesAnswered(long totalQueriesAnswered) {
        this.totalQueriesAnswered = totalQueriesAnswered;
    }

    public long getTotalCropsManaged() {
        return totalCropsManaged;
    }

    public void setTotalCropsManaged(long totalCropsManaged) {
        this.totalCropsManaged = totalCropsManaged;
    }

    public long getTotalAdvisoriesPublished() {
        return totalAdvisoriesPublished;
    }

    public void setTotalAdvisoriesPublished(long totalAdvisoriesPublished) {
        this.totalAdvisoriesPublished = totalAdvisoriesPublished;
    }

    public Map<String, Long> getLanguageDistribution() {
        return languageDistribution;
    }

    public void setLanguageDistribution(Map<String, Long> languageDistribution) {
        this.languageDistribution = languageDistribution;
    }
}
