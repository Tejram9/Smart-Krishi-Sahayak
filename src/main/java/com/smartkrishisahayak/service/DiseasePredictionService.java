package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.DiseasePredictionResult;

/**
 * Abstraction for Plant Disease Diagnostic & Prediction Providers.
 *
 * This clean abstraction enables seamless pluggability of machine-learning models
 * (such as TensorFlow Lite, PyTorch, ONNX, or external computer vision REST APIs)
 * without impacting the controller, persistence, or client layers.
 */
public interface DiseasePredictionService {

    /**
     * Run disease prediction/diagnosis on the provided leaf image and crop parameters.
     *
     * @param cropName         Target crop name (e.g. Tomato, Cotton, Rice, Wheat, Potato, Grapes, Soybean, Sugarcane, General)
     * @param originalFilename Original uploaded file name (may contain diagnostic hints in dev mode)
     * @param notes            Optional farmer notes or observed symptoms
     * @param imageBytes       Raw leaf image binary data for processing
     * @return Diagnostic prediction result including disease, confidence, severity, pathogen, remedies, and prevention
     */
    DiseasePredictionResult predictDisease(String cropName, String originalFilename, String notes, byte[] imageBytes);

    /**
     * Return the name and model description of the active prediction provider.
     */
    String getProviderName();

    /**
     * Returns true if a real trained machine-learning model is active, false for rule-based/mock engine.
     */
    boolean isTrainedModelActive();
}
