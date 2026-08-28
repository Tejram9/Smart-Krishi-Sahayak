package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.DiseasePredictionResult;
import com.smartkrishisahayak.service.impl.RuleBasedDiseasePredictionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RuleBasedDiseasePredictionServiceTest {

    private DiseasePredictionService predictionService;

    @BeforeEach
    void setUp() {
        predictionService = new RuleBasedDiseasePredictionService();
    }

    @Test
    @DisplayName("Provider metadata indicates rule-based diagnostic engine")
    void testProviderMetadata() {
        assertNotNull(predictionService.getProviderName());
        assertTrue(predictionService.getProviderName().contains("Rule-Based"));
        assertFalse(predictionService.isTrainedModelActive());
    }

    @Test
    @DisplayName("Predicts Tomato Late Blight when symptoms indicate water-soaked lesions")
    void testTomatoLateBlightPrediction() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Tomato", "leaf_late_blight.jpg", "water-soaked black spots", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Tomato Late Blight", result.getDiseaseName());
        assertEquals("HIGH", result.getSeverity());
        assertTrue(result.getPathogen().contains("Phytophthora"));
        assertTrue(result.getConfidence() >= 90.0);
        assertTrue(result.getOrganicRemedies().contains("Bordeaux"));
        assertTrue(result.getChemicalRemedies().contains("Metalaxyl"));
    }

    @Test
    @DisplayName("Predicts Cotton Leaf Curl Virus")
    void testCottonLeafCurlPrediction() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Cotton", "cotton_curl.png", "upward leaf curl and whitefly", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Cotton Leaf Curl Disease (CLCuD)", result.getDiseaseName());
        assertEquals("HIGH", result.getSeverity());
        assertTrue(result.getOrganicRemedies().contains("Neem"));
    }

    @Test
    @DisplayName("Predicts Rice Blast Disease")
    void testRiceBlastPrediction() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Rice", "rice_sample.jpg", "spindle lesions on leaves", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Rice Blast Disease", result.getDiseaseName());
        assertTrue(result.getChemicalRemedies().contains("Tricyclazole"));
    }

    @Test
    @DisplayName("Predicts Wheat Yellow Rust")
    void testWheatYellowRustPrediction() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Wheat", "wheat.jpg", "", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Wheat Yellow / Stripe Rust", result.getDiseaseName());
        assertTrue(result.getChemicalRemedies().contains("Propiconazole"));
    }

    @Test
    @DisplayName("Predicts Potato Early Blight")
    void testPotatoEarlyBlightPrediction() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Potato", "potato_leaf.jpg", "target concentric spots", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Potato Early Blight", result.getDiseaseName());
        assertTrue(result.getOrganicRemedies().contains("Trichoderma"));
    }

    @Test
    @DisplayName("Predicts Grape Downy Mildew")
    void testGrapeDownyMildewPrediction() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Grapes", "grape_leaf.png", "yellow oily spots with downy growth", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Grape Downy Mildew", result.getDiseaseName());
        assertTrue(result.getPathogen().contains("Plasmopara"));
    }

    @Test
    @DisplayName("Predicts Sugarcane Red Rot")
    void testSugarcaneRedRotPrediction() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Sugarcane", "sugarcane.jpg", "reddening stalk", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Sugarcane Red Rot", result.getDiseaseName());
        assertTrue(result.getSymptoms().contains("alcoholic odor"));
    }

    @Test
    @DisplayName("Fallback diagnosis for generic crop")
    void testGenericFallbackDiagnosis() {
        DiseasePredictionResult result = predictionService.predictDisease(
                "Papaya", "plant.jpg", "", new byte[]{1, 2, 3});

        assertNotNull(result);
        assertEquals("Cercospora Leaf Spot / Foliar Blight", result.getDiseaseName());
        assertNotNull(result.getOrganicRemedies());
        assertNotNull(result.getChemicalRemedies());
        assertNotNull(result.getPreventiveMeasures());
    }
}
