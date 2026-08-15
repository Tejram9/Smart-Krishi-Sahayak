package com.smartkrishisahayak.entity.enums;

/**
 * Knowledge availability confidence state for agricultural queries.
 */
public enum KnowledgeConfidence {
    /**
     * Published verified agricultural content exists and matches crop/topic.
     */
    SUPPORTED,

    /**
     * Partial content exists (e.g. crop matched, but topic is generic/partial).
     */
    PARTIAL,

    /**
     * No verified knowledge records found in the database.
     */
    UNSUPPORTED
}
