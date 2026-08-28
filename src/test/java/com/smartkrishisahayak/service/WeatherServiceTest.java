package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;
import com.smartkrishisahayak.dto.weather.WeatherData;
import com.smartkrishisahayak.service.impl.WeatherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class WeatherServiceTest {

    private WeatherClient weatherClient;
    private WeatherAdvisoryEngine advisoryEngine;
    private WeatherService weatherService;

    @BeforeEach
    void setUp() {
        weatherClient = Mockito.mock(WeatherClient.class);
        advisoryEngine = new WeatherAdvisoryEngine();
        weatherService = new WeatherServiceImpl(weatherClient, advisoryEngine);
    }

    @Test
    @DisplayName("Returns live weather data when client succeeds")
    void testGetWeatherDataLiveSuccess() {
        WeatherData mockLive = new WeatherData(
                "Pune", "Maharashtra", 18.5204, 73.8567,
                29.5, 30.2, 22.0, 33.0,
                68, 1.2, 12.0, 240,
                1011.5, 45, 61, "Moderate Rain",
                "bi-cloud-rain-fill text-primary", "Open-Meteo Live API", true
        );

        when(weatherClient.fetchLiveWeather("Pune", "Maharashtra")).thenReturn(mockLive);

        WeatherData data = weatherService.getWeatherData("Pune", "Maharashtra");

        assertNotNull(data);
        assertEquals("Pune", data.getLocation());
        assertEquals(29.5, data.getTemperature());
        assertTrue(data.isLive());
        assertEquals("Open-Meteo Live API", data.getProvider());
    }

    @Test
    @DisplayName("Gracefully falls back to seasonal meteorological engine when live client returns null")
    void testGetWeatherDataFallback() {
        when(weatherClient.fetchLiveWeather(anyString(), anyString())).thenReturn(null);

        WeatherData data = weatherService.getWeatherData("Nashik", "Maharashtra");

        assertNotNull(data);
        assertEquals("Nashik", data.getLocation());
        assertNotNull(data.getTemperature());
        assertNotNull(data.getHumidity());
        assertFalse(data.isLive());
        assertTrue(data.getProvider().contains("Meteorological Advisory Model"));
    }

    @Test
    @DisplayName("Generates multilingual weather advisory in Marathi (MR)")
    void testMarathiWeatherAdvisory() {
        WeatherData mockWeather = new WeatherData(
                "Kolhapur", "Maharashtra", 16.7050, 74.2433,
                26.0, 26.5, 22.0, 29.0,
                85, 8.5, 18.0, 220,
                1008.0, 90, 65, "Heavy Rain",
                "bi-cloud-rain-heavy-fill text-primary", "Open-Meteo Live API", true
        );

        when(weatherClient.fetchLiveWeather("Kolhapur", "Maharashtra")).thenReturn(mockWeather);

        WeatherAdvisoryResponse res = weatherService.getWeatherAdvisory("Kolhapur", "Maharashtra", "MR");

        assertNotNull(res);
        assertEquals("Kolhapur", res.getLocation());
        assertTrue(res.getGeneralAdvisory().contains("पाऊस") || res.getGeneralAdvisory().contains("सिंचन"));
        assertFalse(res.getPestDiseaseAlerts().isEmpty());
        assertFalse(res.getFieldWorkRecommendations().isEmpty());
        assertTrue(res.getFieldWorkRecommendations().get(0).contains("वाऱ्याचा वेग") || res.getFieldWorkRecommendations().get(0).contains("फवारणी"));
    }

    @Test
    @DisplayName("Generates multilingual weather advisory in Hindi (HI)")
    void testHindiWeatherAdvisory() {
        WeatherData mockWeather = new WeatherData(
                "Nagpur", "Maharashtra", 21.1458, 79.0882,
                38.0, 39.5, 27.0, 42.0,
                28, 0.0, 8.0, 180,
                1012.0, 10, 0, "Clear Sky",
                "bi-sun-fill text-warning", "Open-Meteo Live API", true
        );

        when(weatherClient.fetchLiveWeather("Nagpur", "Maharashtra")).thenReturn(mockWeather);

        WeatherAdvisoryResponse res = weatherService.getWeatherAdvisory("Nagpur", "Maharashtra", "HI");

        assertNotNull(res);
        assertEquals("Nagpur", res.getLocation());
        assertTrue(res.getGeneralAdvisory().contains("तापमान") || res.getGeneralAdvisory().contains("सिंचाई") || res.getGeneralAdvisory().contains("मौसम"));
        assertFalse(res.getPestDiseaseAlerts().isEmpty());
        assertFalse(res.getFieldWorkRecommendations().isEmpty());
    }

    @Test
    @DisplayName("Generates English weather advisory (EN)")
    void testEnglishWeatherAdvisory() {
        WeatherData mockWeather = new WeatherData(
                "Pune", "Maharashtra", 18.5204, 73.8567,
                28.0, 28.0, 22.0, 32.0,
                65, 0.0, 10.0, 180,
                1013.0, 20, 0, "Clear Sky",
                "bi-sun-fill text-warning", "Open-Meteo Live API", true
        );

        when(weatherClient.fetchLiveWeather("Pune", "Maharashtra")).thenReturn(mockWeather);

        WeatherAdvisoryResponse res = weatherService.getWeatherAdvisory("Pune", "Maharashtra", "EN");

        assertNotNull(res);
        assertEquals("Pune", res.getLocation());
        assertNotNull(res.getGeneralAdvisory());
        assertNotNull(res.getTempCelsius());
        assertNotNull(res.getWindSpeedKmh());
        assertNotNull(res.getWeatherIcon());
    }
}
