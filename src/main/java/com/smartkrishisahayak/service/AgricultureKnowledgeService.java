package com.smartkrishisahayak.service;

import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;

import java.util.List;

/**
 * Service for retrieving verified agricultural knowledge from the MySQL database
 * to ground AI responses in factual, curated farming guidelines.
 */
public interface AgricultureKnowledgeService {

    /**
     * Builds a structured, compact context string containing verified agriculture facts
     * relevant to the user's query and preferred language.
     *
     * @param userQuery         the farmer's question or message
     * @param preferredLanguage the farmer's preferred language (EN, MR, HI)
     * @return formatted context string, or null/empty if no verified content is available
     */
    String buildGroundedContext(String userQuery, PreferredLanguage preferredLanguage);

    /**
     * Identifies and retrieves relevant published verified agriculture content records.
     *
     * @param userQuery         the farmer's query
     * @param preferredLanguage the farmer's preferred language
     * @return list of published verified content matching the query
     */
    List<VerifiedAgricultureContent> findRelevantContent(String userQuery, PreferredLanguage preferredLanguage);

    /**
     * Identifies likely crops referenced in the user's query across English, Marathi, and Hindi.
     *
     * @param userQuery the farmer's question
     * @return list of matching crops
     */
    List<Crop> identifyRelevantCrops(String userQuery);
}
