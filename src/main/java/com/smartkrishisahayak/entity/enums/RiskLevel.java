package com.smartkrishisahayak.entity.enums;

/**
 * Risk classification for agricultural queries.
 */
public enum RiskLevel {
    /**
     * General crop information, general care, basic sowing, basic irrigation, general concepts.
     */
    LOW_RISK,

    /**
     * Pest control, disease symptoms, specific fertilizer recommendations requiring local context.
     */
    MEDIUM_RISK,

    /**
     * Exact pesticide/chemical dosages, chemical mixing, severe toxicity/poisoning, hazardous equipment.
     */
    HIGH_RISK
}
