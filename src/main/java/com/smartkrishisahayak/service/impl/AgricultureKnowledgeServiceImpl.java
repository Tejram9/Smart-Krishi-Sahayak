package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.repository.CropRepository;
import com.smartkrishisahayak.repository.VerifiedAgricultureContentRepository;
import com.smartkrishisahayak.service.AgricultureKnowledgeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of {@link AgricultureKnowledgeService}.
 * <p>
 * Uses deterministic MySQL repository queries, multilingual keyword matching,
 * and topic categorization to retrieve published verified agricultural content.
 */
@Service
public class AgricultureKnowledgeServiceImpl implements AgricultureKnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(AgricultureKnowledgeServiceImpl.class);

    private final CropRepository cropRepository;
    private final VerifiedAgricultureContentRepository contentRepository;

    // Stem/Alias mapping for crops across English, Marathi, Hindi and common inflections
    private static final Map<String, List<String>> CROP_ALIASES = new HashMap<>();

    // Topic keywords mapping
    private static final Map<String, List<String>> TOPIC_KEYWORDS = new HashMap<>();

    static {
        // Crop aliases and stems
        CROP_ALIASES.put("Cotton", Arrays.asList("cotton", "कापूस", "कापसा", "कपास"));
        CROP_ALIASES.put("Soybean", Arrays.asList("soybean", "soya", "सोयाबीन"));
        CROP_ALIASES.put("Sugarcane", Arrays.asList("sugarcane", "cane", "ऊस", "उसा", "गन्ना", "गन्ने"));
        CROP_ALIASES.put("Onion", Arrays.asList("onion", "कांदा", "कांद्या", "प्याज"));
        CROP_ALIASES.put("Wheat", Arrays.asList("wheat", "गहू", "गव्हा", "गेहूं"));
        CROP_ALIASES.put("Turmeric", Arrays.asList("turmeric", "हळद", "हळदी", "हल्दी"));
        CROP_ALIASES.put("Pomegranate", Arrays.asList("pomegranate", "डाळिंब", "डाळिंबा", "अनार"));
        CROP_ALIASES.put("Jowar (Sorghum)", Arrays.asList("jowar", "sorghum", "ज्वारी", "ज्वार"));
        CROP_ALIASES.put("Gram (Chickpea)", Arrays.asList("gram", "chickpea", "हरभरा", "हरभऱ्या", "चना", "चने"));
        CROP_ALIASES.put("Tomato", Arrays.asList("tomato", "टोमॅटो", "टमाटर"));

        // Topic keywords
        TOPIC_KEYWORDS.put("Pest", Arrays.asList(
                "pest", "disease", "insect", "spray", "fungus", "bollworm", "blight", "rot", "caterpillar", "control",
                "कीड", "कीटक", "रोग", "अळी", "बोंडअळी", "करपा", "तैलिया", "कंदकुज", "फवारणी", "सापळे", "नियंत्रण",
                "कीट", "सुंडी", "कीटनाशक", "झुलसा", "छिड़काव", "रोकथाम"
        ));
        TOPIC_KEYWORDS.put("Fertilizer", Arrays.asList(
                "fertilizer", "npk", "nitrogen", "phosphorus", "potash", "urea", "nutrient", "dose", "manure",
                "खत", "खते", "नत्र", "स्फुरद", "पालाश", "युरिया", "पोषण", "मात्रा", "डोस",
                "खाद", "उर्वरक", "नाइट्रोजन", "पोटाश", "यूरिया"
        ));
        TOPIC_KEYWORDS.put("Sowing", Arrays.asList(
                "sowing", "seed", "treatment", "spacing", "planting", "germination",
                "पेरणी", "बियाणे", "बीजप्रक्रिया", "लागवड", "अंतर",
                "बुवाई", "बीज", "बीजोपचार", "रोपाई", "दूरी"
        ));
        TOPIC_KEYWORDS.put("Irrigation", Arrays.asList(
                "irrigation", "water", "drip", "watering", "moisture",
                "पाणी", "सिंचन", "ठिबक", "ओलिताखाली", "पाण्याच्या पाळ्या", "नियोजन",
                "सिंचाई", "पानी", "ड्रिप", "नमी"
        ));
    }

    @Autowired
    public AgricultureKnowledgeServiceImpl(CropRepository cropRepository,
                                           VerifiedAgricultureContentRepository contentRepository) {
        this.cropRepository = cropRepository;
        this.contentRepository = contentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public String buildGroundedContext(String userQuery, PreferredLanguage preferredLanguage) {
        if (userQuery == null || userQuery.trim().isEmpty()) {
            return null;
        }

        List<VerifiedAgricultureContent> relevantContent = findRelevantContent(userQuery, preferredLanguage);
        if (relevantContent.isEmpty()) {
            log.debug("No verified agriculture content found for query: '{}'", userQuery);
            return null;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("=== VERIFIED AGRICULTURE KNOWLEDGE BASE ===\n");
        sb.append("The following information is retrieved directly from official, verified agricultural advisory records.\n\n");

        for (VerifiedAgricultureContent item : relevantContent) {
            Crop crop = item.getCrop();
            String cropName = crop != null
                    ? String.format("%s (मराठी: %s, हिंदी: %s)", crop.getNameEn(), crop.getNameMr(), crop.getNameHi())
                    : "General Agricultural Advisory";

            sb.append("Crop: ").append(cropName).append("\n");
            sb.append("Category: ").append(item.getCategory()).append("\n");
            sb.append("Language of Record: ").append(item.getLanguage()).append("\n");
            sb.append("Title: ").append(item.getTitle()).append("\n");
            sb.append("Verified Guidance:\n").append(item.getContentBody().trim()).append("\n");
            sb.append("----------------------------------------\n");
        }

        return sb.toString().trim();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VerifiedAgricultureContent> findRelevantContent(String userQuery, PreferredLanguage preferredLanguage) {
        if (userQuery == null || userQuery.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedQuery = userQuery.toLowerCase().trim();
        List<Crop> matchedCrops = identifyRelevantCrops(normalizedQuery);
        String matchedTopic = detectTopic(normalizedQuery);

        Set<Long> seenContentIds = new HashSet<>();
        List<VerifiedAgricultureContent> results = new ArrayList<>();

        // 1. If crops matched, retrieve verified content for those crops
        for (Crop crop : matchedCrops) {
            List<VerifiedAgricultureContent> cropContents =
                    contentRepository.findByCropIdAndIsPublishedTrue(crop.getId());

            // Filter by topic if a topic was identified
            List<VerifiedAgricultureContent> filteredByTopic = cropContents;
            if (matchedTopic != null) {
                List<VerifiedAgricultureContent> topicMatches = cropContents.stream()
                        .filter(c -> isCategoryMatch(c.getCategory(), matchedTopic))
                        .collect(Collectors.toList());
                if (!topicMatches.isEmpty()) {
                    filteredByTopic = topicMatches;
                }
            }

            // Prioritize content matching preferred language
            List<VerifiedAgricultureContent> sortedByLanguage = prioritizeLanguage(filteredByTopic, preferredLanguage);

            for (VerifiedAgricultureContent content : sortedByLanguage) {
                if (seenContentIds.add(content.getId())) {
                    results.add(content);
                }
            }
        }

        // 2. If no crops matched or results are empty, perform keyword search on published content
        if (results.isEmpty()) {
            List<String> keywords = extractKeywords(normalizedQuery);
            for (String kw : keywords) {
                if (kw.length() < 3) continue;
                List<VerifiedAgricultureContent> searchHits =
                        contentRepository.searchPublishedContentByKeyword(kw);
                for (VerifiedAgricultureContent hit : searchHits) {
                    if (seenContentIds.add(hit.getId())) {
                        results.add(hit);
                    }
                }
                if (results.size() >= 3) break;
            }
        }

        // Limit results to top 4 relevant records to keep prompt focused
        return results.stream().limit(4).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Crop> identifyRelevantCrops(String userQuery) {
        if (userQuery == null || userQuery.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String normalized = userQuery.toLowerCase().trim();
        List<Crop> allCrops = cropRepository.findAll();
        List<Crop> matched = new ArrayList<>();

        for (Crop crop : allCrops) {
            boolean isMatch = false;

            // Direct field check
            if (containsWordOrSubstring(normalized, crop.getNameEn()) ||
                containsWordOrSubstring(normalized, crop.getNameMr()) ||
                containsWordOrSubstring(normalized, crop.getNameHi())) {
                isMatch = true;
            }

            // Alias/Stem check
            if (!isMatch) {
                for (Map.Entry<String, List<String>> entry : CROP_ALIASES.entrySet()) {
                    if (crop.getNameEn().toLowerCase().contains(entry.getKey().toLowerCase())) {
                        for (String alias : entry.getValue()) {
                            if (containsWordOrSubstring(normalized, alias)) {
                                isMatch = true;
                                break;
                            }
                        }
                    }
                    if (isMatch) break;
                }
            }

            if (isMatch && !matched.contains(crop)) {
                matched.add(crop);
            }
        }

        return matched;
    }

    private String detectTopic(String normalizedQuery) {
        for (Map.Entry<String, List<String>> entry : TOPIC_KEYWORDS.entrySet()) {
            for (String kw : entry.getValue()) {
                if (containsWordOrSubstring(normalizedQuery, kw.toLowerCase())) {
                    return entry.getKey();
                }
            }
        }
        return null;
    }

    private boolean isCategoryMatch(String category, String topicKey) {
        if (category == null || topicKey == null) return false;
        String catLower = category.toLowerCase();
        return switch (topicKey) {
            case "Pest" -> catLower.contains("pest") || catLower.contains("disease") || catLower.contains("कीड") || catLower.contains("रोग");
            case "Fertilizer" -> catLower.contains("fertilizer") || catLower.contains("nutrient") || catLower.contains("खत");
            case "Sowing" -> catLower.contains("sowing") || catLower.contains("seed") || catLower.contains("पेरणी") || catLower.contains("बुवाई");
            case "Irrigation" -> catLower.contains("irrigation") || catLower.contains("water") || catLower.contains("सिंचन") || catLower.contains("पाणी");
            default -> false;
        };
    }

    private List<VerifiedAgricultureContent> prioritizeLanguage(List<VerifiedAgricultureContent> list,
                                                                 PreferredLanguage preferredLanguage) {
        if (preferredLanguage == null) {
            return list;
        }

        List<VerifiedAgricultureContent> preferred = new ArrayList<>();
        List<VerifiedAgricultureContent> fallback = new ArrayList<>();

        for (VerifiedAgricultureContent item : list) {
            if (item.getLanguage() == preferredLanguage) {
                preferred.add(item);
            } else {
                fallback.add(item);
            }
        }

        // If we have content in the preferred language, prioritize it; otherwise include available content
        if (!preferred.isEmpty()) {
            preferred.addAll(fallback);
            return preferred;
        }
        return fallback;
    }

    private boolean containsWordOrSubstring(String text, String target) {
        if (text == null || target == null || target.trim().isEmpty()) {
            return false;
        }
        String t = target.trim().toLowerCase();
        return text.contains(t);
    }

    private List<String> extractKeywords(String query) {
        String[] tokens = query.split("[\\s,;?.!/()\\[\\]\\-]+");
        List<String> keywords = new ArrayList<>();
        for (String token : tokens) {
            String trimmed = token.trim();
            if (trimmed.length() >= 3) {
                keywords.add(trimmed);
            }
        }
        return keywords;
    }
}
