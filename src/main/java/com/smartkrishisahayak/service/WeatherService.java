package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;
import com.smartkrishisahayak.dto.weather.WeatherData;

public interface WeatherService {

    /**
     * Fetch raw meteorological data for the requested district / region.
     */
    WeatherData getWeatherData(String district, String state);

    /**
     * Fetch enriched weather advisory and actionable farming recommendations.
     */
    WeatherAdvisoryResponse getWeatherAdvisory(String district, String state, String language);
}
