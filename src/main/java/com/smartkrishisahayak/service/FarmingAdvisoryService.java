package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.CropRecommendationRequest;
import com.smartkrishisahayak.dto.response.CropRecommendationResponse;
import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;

import java.util.List;

public interface FarmingAdvisoryService {

    List<CropRecommendationResponse> recommendCrops(CropRecommendationRequest request);

    WeatherAdvisoryResponse getWeatherAdvisory(String district, String state, String language);
}
