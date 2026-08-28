package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;
import com.smartkrishisahayak.dto.weather.WeatherData;
import com.smartkrishisahayak.service.WeatherAdvisoryEngine;
import com.smartkrishisahayak.service.WeatherClient;
import com.smartkrishisahayak.service.WeatherService;
import com.smartkrishisahayak.util.IndianDistrictGeoLocator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WeatherServiceImpl implements WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherServiceImpl.class);

    private final WeatherClient weatherClient;
    private final WeatherAdvisoryEngine advisoryEngine;

    @Value("${app.weather.cache-ttl-minutes:15}")
    private long cacheTtlMinutes;

    private static class CacheEntry {
        final WeatherData data;
        final LocalDateTime cachedAt;

        CacheEntry(WeatherData data) {
            this.data = data;
            this.cachedAt = LocalDateTime.now();
        }

        boolean isExpired(long ttlMinutes) {
            return cachedAt.plusMinutes(ttlMinutes).isBefore(LocalDateTime.now());
        }
    }

    private final Map<String, CacheEntry> weatherCache = new ConcurrentHashMap<>();

    @Autowired
    public WeatherServiceImpl(WeatherClient weatherClient, WeatherAdvisoryEngine advisoryEngine) {
        this.weatherClient = weatherClient;
        this.advisoryEngine = advisoryEngine;
    }

    @Override
    public WeatherData getWeatherData(String district, String state) {
        String dist = (district != null && !district.trim().isEmpty()) ? district.trim() : "Maharashtra";
        String st = (state != null && !state.trim().isEmpty()) ? state.trim() : "Maharashtra";
        String cacheKey = (dist + "_" + st).toLowerCase();

        // 1. Check in-memory cache
        CacheEntry entry = weatherCache.get(cacheKey);
        if (entry != null && !entry.isExpired(cacheTtlMinutes)) {
            log.debug("Returning cached weather data for key: {}", cacheKey);
            return entry.data;
        }

        // 2. Fetch live data from WeatherClient
        WeatherData liveData = weatherClient.fetchLiveWeather(dist, st);

        if (liveData != null) {
            weatherCache.put(cacheKey, new CacheEntry(liveData));
            return liveData;
        }

        // 3. Fallback to seasonal meteorological model
        log.info("Generating regional meteorological fallback data for [district={}, state={}]", dist, st);
        WeatherData fallback = generateFallbackWeatherData(dist, st);
        weatherCache.put(cacheKey, new CacheEntry(fallback));
        return fallback;
    }

    @Override
    public WeatherAdvisoryResponse getWeatherAdvisory(String district, String state, String language) {
        WeatherData weather = getWeatherData(district, state);
        return advisoryEngine.generateAdvisory(weather, language);
    }

    private WeatherData generateFallbackWeatherData(String district, String state) {
        IndianDistrictGeoLocator.Coordinates coords = IndianDistrictGeoLocator.resolveCoordinates(district, state);
        String resolvedLocation = coords.getDistrictName();
        String resolvedState = coords.getStateName();

        Month currentMonth = LocalDate.now().getMonth();
        double temp;
        double minTemp;
        double maxTemp;
        int humidity;
        double precipitation;
        double windSpeed = 11.5;
        int windDir = 210;
        int cloudCover;
        int weatherCode;
        String conditionText;
        String weatherIcon;

        int monthVal = currentMonth.getValue();
        if (monthVal >= 6 && monthVal <= 9) {
            // Monsoon
            temp = 27.5;
            minTemp = 23.0;
            maxTemp = 31.0;
            humidity = 82;
            precipitation = 4.2;
            cloudCover = 75;
            weatherCode = 61;
            conditionText = "Cloudy with Rain Showers";
            weatherIcon = "bi-cloud-rain-fill text-primary";
        } else if (monthVal >= 10 || monthVal <= 2) {
            // Winter / Rabi
            temp = 24.0;
            minTemp = 14.5;
            maxTemp = 29.5;
            humidity = 52;
            precipitation = 0.0;
            cloudCover = 15;
            weatherCode = 0;
            conditionText = "Clear Sky & Sunny";
            weatherIcon = "bi-sun-fill text-warning";
        } else {
            // Summer / Zaid
            temp = 36.5;
            minTemp = 25.0;
            maxTemp = 41.0;
            humidity = 32;
            precipitation = 0.0;
            cloudCover = 10;
            weatherCode = 1;
            conditionText = "Hot & Sunny";
            weatherIcon = "bi-sun-fill text-warning";
        }

        return new WeatherData(
                resolvedLocation,
                resolvedState,
                coords.getLatitude(),
                coords.getLongitude(),
                temp,
                temp,
                minTemp,
                maxTemp,
                humidity,
                precipitation,
                windSpeed,
                windDir,
                1012.0,
                cloudCover,
                weatherCode,
                conditionText,
                weatherIcon,
                "Meteorological Advisory Model (Offline/Dev)",
                false
        );
    }
}
