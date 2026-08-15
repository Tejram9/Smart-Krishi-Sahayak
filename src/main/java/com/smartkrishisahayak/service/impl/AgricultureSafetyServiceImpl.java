package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.response.SafetyAssessment;
import com.smartkrishisahayak.entity.enums.KnowledgeConfidence;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.RiskLevel;
import com.smartkrishisahayak.service.AgricultureSafetyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Implementation of {@link AgricultureSafetyService}.
 * <p>
 * Provides deterministic, rule-based safety classification, off-topic query detection,
 * risk tier assessment (LOW, MEDIUM, HIGH), and localized expert referral enforcement.
 */
@Service
public class AgricultureSafetyServiceImpl implements AgricultureSafetyService {

    private static final Logger log = LoggerFactory.getLogger(AgricultureSafetyServiceImpl.class);

    // Off-topic indicators (programming, general sports, entertainment, politics, crypto, non-agri trivia)
    private static final List<String> OFF_TOPIC_KEYWORDS = Arrays.asList(
            "python", "java", "javascript", "c++", "write code", "html", "css", "sql query", "program",
            "football", "fifa", "messi", "ronaldo", "ipl score", "cricket match", "cinema", "movie",
            "actor", "actress", "song", "lyrics", "capital of", "prime minister", "president of",
            "bitcoin", "crypto", "stock market", "casino", "gambling",
            "पायथन", "जावा", "कोड", "प्रोग्राम", "चित्रपट", "गाणे", "सिनेमा", "क्रिकेट", "फुटबॉल", "राजकारण",
            "गाना", "फिल्म", "राजनीति", "शेयर बाजार", "क्रिप्टो"
    );

    // Overriding agricultural terms that indicate a farming query
    private static final List<String> AGRI_KEYWORDS = Arrays.asList(
            "crop", "soil", "farm", "farmer", "agriculture", "krishi", "pest", "fertilizer", "seed",
            "sowing", "irrigation", "water", "harvest", "plant", "cotton", "soybean", "wheat", "onion",
            "sugarcane", "turmeric", "pomegranate", "tomato", "jowar", "gram",
            "कापूस", "सोयाबीन", "ऊस", "कांदा", "गहू", "हळद", "डाळिंब", "ज्वारी", "हरभरा", "टोमॅटो",
            "शेत", "शेती", "शेतकरी", "पीक", "पिके", "माती", "खत", "खते", "कीड", "रोग", "पेरणी", "पाणी", "सिंचन", "फवारणी",
            "कपास", "गन्ना", "प्याज", "गेहूं", "हल्दी", "अनार", "ज्वार", "चना", "टमाटर",
            "फसल", "खेती", "किसान", "कृषि", "मिट्टी", "खाद", "कीट", "रोग", "बुवाई", "सिंचाई", "छिड़काव"
    );

    // High-risk indicators (exact chemical dosages, cocktail chemical mixing, poisoning, toxicity)
    private static final List<String> HIGH_RISK_KEYWORDS = Arrays.asList(
            "exact dosage", "dosage ratio", "mixing ratio", "mix pesticide", "tank mix", "cocktail spray",
            "lethal dose", "poisoning", "toxic dose", "overdose", "chemical dosage", "mix chemicals",
            "औषधांचे प्रमाण", "कीटकनाशक प्रमाण", "खताचे प्रमाण", "डोस", "मिश्रण", "विषबाधा", "एकत्र फवारणी",
            "औषध एकत्र मिसळणे", "अतिप्रमाण", "दोन कीटकनाशके एकत्र",
            "सटीक मात्रा", "कीटनाशक की मात्रा", "दवा की मात्रा", "मिश्रण", "जहर", "विषाक्तता",
            "एक साथ मिलाना", "कीटनाशक का घोल", "डोज", "दवाएं मिलाना"
    );

    // Medium-risk indicators (pest problems, diseases, symptoms, control sprays)
    private static final List<String> MEDIUM_RISK_KEYWORDS = Arrays.asList(
            "pest", "disease", "blight", "rot", "infestation", "fungus", "caterpillar", "bollworm",
            "spots", "wilt", "yellowing", "spray", "damage", "control", "symptom",
            "कीड", "रोग", "अळी", "बोंडअळी", "करपा", "तैलिया", "कंदकुज", "मावा", "तुडतुडे", "फवारणी", "नियंत्रण", "नुकसान",
            "कीट", "रोग", "सुंडी", "झुलसा", "इल्ली", "कीटनाशक", "रोकथाम", "नुकसान", "छिड़काव", "लक्षण"
    );

    @Override
    public SafetyAssessment evaluateQuery(String userQuery, PreferredLanguage language, String verifiedContext) {
        PreferredLanguage targetLang = language != null ? language : PreferredLanguage.EN;

        if (userQuery == null || userQuery.trim().isEmpty()) {
            return SafetyAssessment.agricultural(RiskLevel.LOW_RISK, KnowledgeConfidence.UNSUPPORTED, getExpertReferralNotice(targetLang));
        }

        String normalized = userQuery.toLowerCase().trim();

        // 1. Off-topic check
        if (isOffTopic(normalized)) {
            log.info("Detected off-topic query: '{}'", userQuery);
            return SafetyAssessment.offTopic(getOffTopicResponse(targetLang));
        }

        // 2. Risk classification
        RiskLevel riskLevel = classifyRisk(normalized);

        // 3. Knowledge confidence
        KnowledgeConfidence confidence = (verifiedContext != null && !verifiedContext.trim().isEmpty())
                ? KnowledgeConfidence.SUPPORTED
                : KnowledgeConfidence.UNSUPPORTED;

        String referralNotice = getExpertReferralNotice(targetLang);

        log.debug("Safety evaluation for query [riskLevel={}, confidence={}, lang={}]",
                riskLevel, confidence, targetLang);

        return SafetyAssessment.agricultural(riskLevel, confidence, referralNotice);
    }

    @Override
    public String sanitizeAiResponse(String aiResponse, String userQuery, PreferredLanguage language, SafetyAssessment assessment) {
        PreferredLanguage targetLang = language != null ? language : PreferredLanguage.EN;

        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            if (assessment != null && assessment.getConfidence() == KnowledgeConfidence.UNSUPPORTED) {
                return getUnsupportedKnowledgeResponse(targetLang);
            }
            return getExpertReferralNotice(targetLang);
        }

        String sanitized = aiResponse.trim();

        // If query was HIGH_RISK and response doesn't mention expert / Krishi Seva Kendra, append referral
        if (assessment != null && assessment.getRiskLevel() == RiskLevel.HIGH_RISK) {
            if (!containsExpertReferralMention(sanitized)) {
                sanitized = sanitized + "\n\n" + getExpertReferralNotice(targetLang);
            }
        }

        return sanitized;
    }

    @Override
    public boolean isOffTopic(String userQuery) {
        if (userQuery == null || userQuery.trim().isEmpty()) {
            return false;
        }

        String lower = userQuery.toLowerCase().trim();

        // Check off-topic triggers using word-boundary matching
        for (String offTopic : OFF_TOPIC_KEYWORDS) {
            if (containsKeyword(lower, offTopic)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsKeyword(String text, String keyword) {
        if (text == null || keyword == null || keyword.trim().isEmpty()) {
            return false;
        }
        String kw = keyword.trim().toLowerCase();
        // If keyword is ASCII/English letters, enforce word boundaries
        if (kw.matches("^[a-z0-9\\s+\\-]+$")) {
            String regex = "(?i).*\\b" + java.util.regex.Pattern.quote(kw) + "\\b.*";
            return text.matches(regex);
        } else {
            // For Devanagari script (Marathi/Hindi), check substring
            return text.contains(kw);
        }
    }

    @Override
    public String getOffTopicResponse(PreferredLanguage language) {
        if (language == null) {
            language = PreferredLanguage.EN;
        }
        return switch (language) {
            case MR -> "मी 'स्मार्ट कृषी सहाय्यक' आहे, जो शेतकऱ्यांना पिके, माती, खते, सिंचन आणि कीड व्यवस्थापनात मदत करण्यासाठी समर्पित आहे. कृपया शेतीशी संबंधित प्रश्न विचारा.";
            case HI -> "मैं 'स्मार्ट कृषि सहायक' हूँ, जो किसानों को फसलों, मिट्टी, खाद, सिंचाई और कीट प्रबंधन में सहायता के लिए समर्पित है। कृपया कृषि से संबंधित प्रश्न पूछें।";
            default -> "I am Smart Krishi Sahayak, an AI assistant dedicated to helping farmers with crop, soil, fertilizer, irrigation, and pest management queries. Please ask an agriculture-related question.";
        };
    }

    @Override
    public String getUnsupportedKnowledgeResponse(PreferredLanguage language) {
        if (language == null) {
            language = PreferredLanguage.EN;
        }
        return switch (language) {
            case MR -> "माझ्या कृषी ज्ञानकोशात या विशिष्ट पिकासाठी किंवा विषयासाठी सध्या सत्यापित माहिती उपलब्ध नाही. कृपया शेत-विशिष्ट मार्गदर्शनासाठी स्थानिक कृषी अधिकारी किंवा कृषी सेवा केंद्राशी संपर्क साधा.";
            case HI -> "मेरे कृषि ज्ञानकोश में इस विशिष्ट फसल या विषय के लिए वर्तमान में सत्यापित जानकारी उपलब्ध नहीं है। कृपया विशिष्ट मार्गदर्शन के लिए अपने स्थानीय कृषि अधिकारी या कृषि सेवा केंद्र से संपर्क करें।";
            default -> "I do not currently have verified information for this specific crop or topic in my agriculture knowledge base. Please consult your local agriculture officer or Krishi Seva Kendra for field-specific guidance.";
        };
    }

    @Override
    public String getExpertReferralNotice(PreferredLanguage language) {
        if (language == null) {
            language = PreferredLanguage.EN;
        }
        return switch (language) {
            case MR -> "महत्त्वाचे: रासायनिक उपचार, कीटकनाशकांचे प्रमाण किंवा पिकांवरील गंभीर रोगांसाठी प्रत्यक्ष शेतातील पाहणी आवश्यक आहे. कृपया स्थानिक कृषी सेवा केंद्र किंवा कृषी सहाय्यकांचा सल्ला घ्या.";
            case HI -> "महत्वपूर्ण: रासायनिक उपचार, कीटनाशकों की मात्रा या गंभीर फसल रोग के लिए खेत का प्रत्यक्ष निरीक्षण आवश्यक है। कृपया अपने स्थानीय कृषि सेवा केंद्र या कृषि अधिकारी से संपर्क करें।";
            default -> "Important: For chemical treatments, pesticide dosages, or severe crop disease, field inspection is recommended. Please consult your local Krishi Seva Kendra or Agriculture Extension Officer.";
        };
    }

    private RiskLevel classifyRisk(String lowerQuery) {
        for (String kw : HIGH_RISK_KEYWORDS) {
            if (lowerQuery.contains(kw.toLowerCase())) {
                return RiskLevel.HIGH_RISK;
            }
        }

        for (String kw : MEDIUM_RISK_KEYWORDS) {
            if (lowerQuery.contains(kw.toLowerCase())) {
                return RiskLevel.MEDIUM_RISK;
            }
        }

        return RiskLevel.LOW_RISK;
    }

    private boolean containsExpertReferralMention(String text) {
        String lower = text.toLowerCase();
        return lower.contains("krishi seva kendra") ||
               lower.contains("agriculture officer") ||
               lower.contains("कृषी सेवा केंद्र") ||
               lower.contains("कृषी अधिकारी") ||
               lower.contains("कृषि सेवा केंद्र") ||
               lower.contains("कृषि अधिकारी") ||
               lower.contains("expert") ||
               lower.contains("तज्ज्ञ") ||
               lower.contains("विशेषज्ञ");
    }
}
