package com.smartkrishisahayak.dto.response;

import com.smartkrishisahayak.entity.enums.KnowledgeConfidence;
import com.smartkrishisahayak.entity.enums.RiskLevel;

/**
 * Encapsulates the safety evaluation of a farmer query.
 */
public class SafetyAssessment {

    private final RiskLevel riskLevel;
    private final KnowledgeConfidence confidence;
    private final boolean isOffTopic;
    private final String directResponse;
    private final String expertReferralNotice;

    public SafetyAssessment(RiskLevel riskLevel, KnowledgeConfidence confidence, boolean isOffTopic,
                            String directResponse, String expertReferralNotice) {
        this.riskLevel = riskLevel;
        this.confidence = confidence;
        this.isOffTopic = isOffTopic;
        this.directResponse = directResponse;
        this.expertReferralNotice = expertReferralNotice;
    }

    public static SafetyAssessment offTopic(String redirectMessage) {
        return new SafetyAssessment(RiskLevel.LOW_RISK, KnowledgeConfidence.UNSUPPORTED, true, redirectMessage, null);
    }

    public static SafetyAssessment agricultural(RiskLevel riskLevel, KnowledgeConfidence confidence, String expertReferralNotice) {
        return new SafetyAssessment(riskLevel, confidence, false, null, expertReferralNotice);
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public KnowledgeConfidence getConfidence() {
        return confidence;
    }

    public boolean isOffTopic() {
        return isOffTopic;
    }

    public String getDirectResponse() {
        return directResponse;
    }

    public String getExpertReferralNotice() {
        return expertReferralNotice;
    }
}
