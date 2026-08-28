package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.weather.WeatherData;

/**
 * Interface for external Meteorological API Clients.
 */
public interface WeatherClient {

    /**
     * Fetch real-time weather observations for a target location and state.
     *
     * @param location Target district or city name
     * @param state    Target state name
     * @return WeatherData object or null if request fails / provider is mock
     */
    WeatherData fetchLiveWeather(String location, String state);
}
