package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.request.CropRecommendationRequest;
import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.CropRecommendationResponse;
import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;
import com.smartkrishisahayak.service.FarmingAdvisoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/advisory")
public class FarmingAdvisoryController {

    private final FarmingAdvisoryService advisoryService;

    @Autowired
    public FarmingAdvisoryController(FarmingAdvisoryService advisoryService) {
        this.advisoryService = advisoryService;
    }

    /**
     * Recommend best-fit crops based on season, soil, and water availability.
     */
    @PostMapping("/recommend-crops")
    public ResponseEntity<ApiResponse<List<CropRecommendationResponse>>> recommendCrops(
            @Valid @RequestBody CropRecommendationRequest request) {
        List<CropRecommendationResponse> recommendations = advisoryService.recommendCrops(request);
        return ResponseEntity.ok(ApiResponse.success("Crop recommendations generated successfully.", recommendations));
    }

    /**
     * Get localized weather insights and seasonal agricultural advisory.
     */
    @GetMapping("/weather")
    public ResponseEntity<ApiResponse<WeatherAdvisoryResponse>> getWeatherAdvisory(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String language) {
        WeatherAdvisoryResponse advisory = advisoryService.getWeatherAdvisory(district, state, language);
        return ResponseEntity.ok(ApiResponse.success("Weather advisory fetched successfully.", advisory));
    }
}
