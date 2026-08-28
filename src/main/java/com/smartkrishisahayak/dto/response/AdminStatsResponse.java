package com.smartkrishisahayak.dto.response;

import java.util.List;
import java.util.Map;

public class AdminStatsResponse {

    private long totalFarmers;
    private long totalQueriesAnswered;
    private long totalCropsManaged;
    private long totalAdvisoriesPublished;
    private Map<String, Long> languageDistribution;
    private List<DailyQueryStat> recentQueriesPerDay;

    public AdminStatsResponse() {}

    public AdminStatsResponse(long totalFarmers, long totalQueriesAnswered, long totalCropsManaged,
                              long totalAdvisoriesPublished, Map<String, Long> languageDistribution,
                              List<DailyQueryStat> recentQueriesPerDay) {
        this.totalFarmers = totalFarmers;
        this.totalQueriesAnswered = totalQueriesAnswered;
        this.totalCropsManaged = totalCropsManaged;
        this.totalAdvisoriesPublished = totalAdvisoriesPublished;
        this.languageDistribution = languageDistribution;
        this.recentQueriesPerDay = recentQueriesPerDay;
    }

    public long getTotalFarmers() {
        return totalFarmers;
    }

    public void setTotalFarmers(long totalFarmers) {
        this.totalFarmers = totalFarmers;
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

    public List<DailyQueryStat> getRecentQueriesPerDay() {
        return recentQueriesPerDay;
    }

    public void setRecentQueriesPerDay(List<DailyQueryStat> recentQueriesPerDay) {
        this.recentQueriesPerDay = recentQueriesPerDay;
    }

    public static class DailyQueryStat {
        private String date;
        private long count;

        public DailyQueryStat() {}

        public DailyQueryStat(String date, long count) {
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
}
