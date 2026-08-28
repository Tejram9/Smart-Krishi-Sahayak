package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;
import com.smartkrishisahayak.dto.weather.WeatherData;
import com.smartkrishisahayak.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/weather")
public class WeatherController {

    private final WeatherService weatherService;

    @Autowired
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    /**
     * Get real-time weather meteorological parameters for a location.
     */
    @GetMapping({"", "/current"})
    public ResponseEntity<ApiResponse<WeatherData>> getCurrentWeather(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String state) {
        WeatherData weather = weatherService.getWeatherData(district, state);
        return ResponseEntity.ok(ApiResponse.success("Current weather fetched successfully.", weather));
    }

    /**
     * Get enriched agricultural weather advisory, pest warnings, and field recommendations.
     */
    @GetMapping("/advisory")
    public ResponseEntity<ApiResponse<WeatherAdvisoryResponse>> getWeatherAdvisory(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String language) {
        WeatherAdvisoryResponse advisory = weatherService.getWeatherAdvisory(district, state, language);
        return ResponseEntity.ok(ApiResponse.success("Weather advisory fetched successfully.", advisory));
    }
}
