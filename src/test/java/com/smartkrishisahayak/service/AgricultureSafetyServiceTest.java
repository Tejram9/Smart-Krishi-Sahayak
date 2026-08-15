package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.SafetyAssessment;
import com.smartkrishisahayak.entity.enums.KnowledgeConfidence;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.RiskLevel;
import com.smartkrishisahayak.service.impl.AgricultureSafetyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AgricultureSafetyServiceTest {

    private AgricultureSafetyServiceImpl safetyService;

    @BeforeEach
    void setUp() {
        safetyService = new AgricultureSafetyServiceImpl();
    }

    @Test
    @DisplayName("Test 1: Low-risk agriculture question is classified as LOW_RISK")
    void lowRiskQuery_classifiedAsLowRisk() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "What crops grow well in black soil?",
                PreferredLanguage.EN,
                "Context for black soil crops"
        );

        assertThat(assessment.isOffTopic()).isFalse();
        assertThat(assessment.getRiskLevel()).isEqualTo(RiskLevel.LOW_RISK);
        assertThat(assessment.getConfidence()).isEqualTo(KnowledgeConfidence.SUPPORTED);
    }

    @Test
    @DisplayName("Test 2: Medium-risk pest question is classified as MEDIUM_RISK")
    void mediumRiskPestQuery_classifiedAsMediumRisk() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "My cotton crop has a pest problem. What should I check?",
                PreferredLanguage.EN,
                "Context for cotton pest control"
        );

        assertThat(assessment.isOffTopic()).isFalse();
        assertThat(assessment.getRiskLevel()).isEqualTo(RiskLevel.MEDIUM_RISK);
        assertThat(assessment.getConfidence()).isEqualTo(KnowledgeConfidence.SUPPORTED);
    }

    @Test
    @DisplayName("Test 3: High-risk chemical dosage request is classified as HIGH_RISK with expert referral")
    void highRiskChemicalDosageQuery_classifiedAsHighRisk() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "Give me the exact pesticide dosage and mixing ratio for my cotton crop.",
                PreferredLanguage.EN,
                "Verified context for cotton"
        );

        assertThat(assessment.isOffTopic()).isFalse();
        assertThat(assessment.getRiskLevel()).isEqualTo(RiskLevel.HIGH_RISK);
        assertThat(assessment.getExpertReferralNotice()).contains("Krishi Seva Kendra");
    }

    @Test
    @DisplayName("Test 4: High-risk Marathi chemical mixing query is classified as HIGH_RISK")
    void highRiskMarathiQuery_classifiedAsHighRisk() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "कापसासाठी दोन कीटकनाशके एकत्र करून औषधांचे प्रमाण सांगा",
                PreferredLanguage.MR,
                null
        );

        assertThat(assessment.isOffTopic()).isFalse();
        assertThat(assessment.getRiskLevel()).isEqualTo(RiskLevel.HIGH_RISK);
        assertThat(assessment.getConfidence()).isEqualTo(KnowledgeConfidence.UNSUPPORTED);
        assertThat(assessment.getExpertReferralNotice()).contains("कृषी सेवा केंद्र");
    }

    @Test
    @DisplayName("Test 5: High-risk Hindi chemical mixing query is classified as HIGH_RISK")
    void highRiskHindiQuery_classifiedAsHighRisk() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "कपास में कीटनाशक की सटीक मात्रा और मिश्रण बताओ",
                PreferredLanguage.HI,
                null
        );

        assertThat(assessment.isOffTopic()).isFalse();
        assertThat(assessment.getRiskLevel()).isEqualTo(RiskLevel.HIGH_RISK);
        assertThat(assessment.getConfidence()).isEqualTo(KnowledgeConfidence.UNSUPPORTED);
        assertThat(assessment.getExpertReferralNotice()).contains("कृषि सेवा केंद्र");
    }

    @Test
    @DisplayName("Test 6: Off-topic English query is detected and redirected politely")
    void offTopicEnglishQuery_returnsPoliteRedirect() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "Who won yesterday's football match?",
                PreferredLanguage.EN,
                null
        );

        assertThat(assessment.isOffTopic()).isTrue();
        assertThat(assessment.getDirectResponse()).contains("Smart Krishi Sahayak");
        assertThat(assessment.getDirectResponse()).contains("agriculture-related question");
    }

    @Test
    @DisplayName("Test 7: Off-topic Marathi query is detected and redirected in Marathi")
    void offTopicMarathiQuery_returnsMarathiRedirect() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "पायथन प्रोग्राम कसा लिहावा?",
                PreferredLanguage.MR,
                null
        );

        assertThat(assessment.isOffTopic()).isTrue();
        assertThat(assessment.getDirectResponse()).contains("स्मार्ट कृषी सहाय्यक");
        assertThat(assessment.getDirectResponse()).contains("शेतीशी संबंधित प्रश्न विचारा");
    }

    @Test
    @DisplayName("Test 8: Off-topic Hindi query is detected and redirected in Hindi")
    void offTopicHindiQuery_returnsHindiRedirect() {
        SafetyAssessment assessment = safetyService.evaluateQuery(
                "क्रिकेट मैच का स्कोर क्या है?",
                PreferredLanguage.HI,
                null
        );

        assertThat(assessment.isOffTopic()).isTrue();
        assertThat(assessment.getDirectResponse()).contains("स्मार्ट कृषि सहायक");
        assertThat(assessment.getDirectResponse()).contains("कृषि से संबंधित प्रश्न पूछें");
    }

    @Test
    @DisplayName("Test 9: Unsupported knowledge state returns localized no-knowledge disclosure")
    void unsupportedKnowledge_returnsLocalizedDisclosure() {
        String enDisclosure = safetyService.getUnsupportedKnowledgeResponse(PreferredLanguage.EN);
        assertThat(enDisclosure).contains("do not currently have verified information");

        String mrDisclosure = safetyService.getUnsupportedKnowledgeResponse(PreferredLanguage.MR);
        assertThat(mrDisclosure).contains("सत्यापित माहिती उपलब्ध नाही");

        String hiDisclosure = safetyService.getUnsupportedKnowledgeResponse(PreferredLanguage.HI);
        assertThat(hiDisclosure).contains("सत्यापित जानकारी उपलब्ध नहीं है");
    }

    @Test
    @DisplayName("Test 10: Response sanitization appends expert referral when missing on HIGH_RISK query")
    void sanitizeAiResponse_highRiskWithoutReferral_appendsReferral() {
        SafetyAssessment assessment = SafetyAssessment.agricultural(
                RiskLevel.HIGH_RISK,
                KnowledgeConfidence.SUPPORTED,
                safetyService.getExpertReferralNotice(PreferredLanguage.EN)
        );

        String rawAiOutput = "Spray Monocrotophos 36 SL on the affected field.";
        String sanitized = safetyService.sanitizeAiResponse(
                rawAiOutput,
                "Give me exact pesticide dosage",
                PreferredLanguage.EN,
                assessment
        );

        assertThat(sanitized).contains("Spray Monocrotophos");
        assertThat(sanitized).contains("Krishi Seva Kendra");
    }

    @Test
    @DisplayName("Test 11: Response sanitization retains safe response when referral is already present")
    void sanitizeAiResponse_highRiskWithReferral_retainsCleanResponse() {
        SafetyAssessment assessment = SafetyAssessment.agricultural(
                RiskLevel.HIGH_RISK,
                KnowledgeConfidence.SUPPORTED,
                safetyService.getExpertReferralNotice(PreferredLanguage.EN)
        );

        String compliantAiOutput = "Apply Neem oil @ 5ml/L. For severe infestations, please consult your local Krishi Seva Kendra.";
        String sanitized = safetyService.sanitizeAiResponse(
                compliantAiOutput,
                "Pest control tips",
                PreferredLanguage.EN,
                assessment
        );

        assertThat(sanitized).isEqualTo(compliantAiOutput);
    }
}
