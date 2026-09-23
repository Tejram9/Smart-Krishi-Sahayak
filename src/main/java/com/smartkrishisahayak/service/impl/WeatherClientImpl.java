package com.smartkrishisahayak.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartkrishisahayak.dto.weather.WeatherData;
import com.smartkrishisahayak.service.WeatherClient;
import com.smartkrishisahayak.util.IndianDistrictGeoLocator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Component
public class WeatherClientImpl implements WeatherClient {

    private static final Logger log = LoggerFactory.getLogger(WeatherClientImpl.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.weather.provider:open-meteo}")
    private String weatherProvider;

    @Value("${app.weather.api-key:}")
    private String apiKey;

    @Value("${app.weather.base-url:https://api.open-meteo.com/v1}")
    private String baseUrl;

    @org.springframework.beans.factory.annotation.Autowired
    public WeatherClientImpl(RestTemplateBuilder restTemplateBuilder,
                             ObjectMapper objectMapper,
                             @Value("${app.weather.timeout-ms:5000}") String timeoutMsStr) {
        this(restTemplateBuilder, objectMapper, parseTimeout(timeoutMsStr, 5000L));
    }

    public WeatherClientImpl(RestTemplateBuilder restTemplateBuilder,
                             ObjectMapper objectMapper,
                             long timeoutMs) {
        long effectiveTimeout = timeoutMs > 0 ? timeoutMs : 5000L;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(effectiveTimeout))
                .setReadTimeout(Duration.ofMillis(effectiveTimeout))
                .build();
        this.objectMapper = objectMapper;
    }

    private static long parseTimeout(String value, long defaultVal) {
        if (value == null || value.trim().isEmpty()) {
            return defaultVal;
        }
        try {
            long parsed = Long.parseLong(value.trim());
            return parsed > 0 ? parsed : defaultVal;
        } catch (NumberFormatException e) {
            log.warn("Invalid weather timeout value '{}', falling back to default {} ms", value, defaultVal);
            return defaultVal;
        }
    }

    private String getEffectiveBaseUrl() {
        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            return "https://api.open-meteo.com/v1";
        }
        return baseUrl.trim();
    }

    @Override
    public WeatherData fetchLiveWeather(String location, String state) {
        if ("mock".equalsIgnoreCase(weatherProvider)) {
            log.debug("Weather provider is set to 'mock', skipping external HTTP request.");
            return null;
        }

        try {
            IndianDistrictGeoLocator.Coordinates coords = IndianDistrictGeoLocator.resolveCoordinates(location, state);
            String resolvedLocation = coords.getDistrictName();
            String resolvedState = coords.getStateName();

            if ("openweathermap".equalsIgnoreCase(weatherProvider) && apiKey != null && !apiKey.trim().isEmpty()) {
                return fetchFromOpenWeatherMap(resolvedLocation, resolvedState);
            } else {
                // Default: High-precision Open-Meteo REST API
                return fetchFromOpenMeteo(coords.getLatitude(), coords.getLongitude(), resolvedLocation, resolvedState);
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch live weather data for [location={}, state={}]: {}", location, state, ex.getMessage());
            return null;
        }
    }

    private WeatherData fetchFromOpenMeteo(double lat, double lon, String location, String state) {
        String url = String.format(
                "%s/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata",
                getEffectiveBaseUrl(), lat, lon
        );

        log.debug("Calling Open-Meteo API: {}", url);
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.warn("Open-Meteo returned status: {}", response.getStatusCode());
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode current = root.path("current");
            JsonNode daily = root.path("daily");

            double temp = current.path("temperature_2m").asDouble(28.0);
            double feelsLike = current.path("apparent_temperature").asDouble(temp);
            int humidity = current.path("relative_humidity_2m").asInt(65);
            double precipitation = current.path("precipitation").asDouble(0.0);
            int weatherCode = current.path("weather_code").asInt(0);
            double windSpeed = current.path("wind_speed_10m").asDouble(10.0);
            int windDir = current.path("wind_direction_10m").asInt(180);
            double pressure = current.path("surface_pressure").asDouble(1013.0);
            int cloudCover = current.path("cloud_cover").asInt(20);

            double maxTemp = temp + 4.0;
            double minTemp = temp - 4.0;
            if (daily.has("temperature_2m_max") && daily.path("temperature_2m_max").isArray() && !daily.path("temperature_2m_max").isEmpty()) {
                maxTemp = daily.path("temperature_2m_max").get(0).asDouble(maxTemp);
            }
            if (daily.has("temperature_2m_min") && daily.path("temperature_2m_min").isArray() && !daily.path("temperature_2m_min").isEmpty()) {
                minTemp = daily.path("temperature_2m_min").get(0).asDouble(minTemp);
            }

            WmoInfo wmo = mapWmoCode(weatherCode);

            return new WeatherData(
                    location,
                    state,
                    lat,
                    lon,
                    temp,
                    feelsLike,
                    minTemp,
                    maxTemp,
                    humidity,
                    precipitation,
                    windSpeed,
                    windDir,
                    pressure,
                    cloudCover,
                    weatherCode,
                    wmo.conditionText,
                    wmo.icon,
                    "Open-Meteo Live API",
                    true
            );
        } catch (Exception ex) {
            log.warn("Error parsing Open-Meteo JSON response: {}", ex.getMessage());
            return null;
        }
    }

    private WeatherData fetchFromOpenWeatherMap(String location, String state) {
        String url = String.format(
                "https://api.openweathermap.org/data/2.5/weather?q=%s,%s,IN&appid=%s&units=metric",
                location, state, apiKey
        );

        log.debug("Calling OpenWeatherMap API for location: {}", location);
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode main = root.path("main");
            JsonNode wind = root.path("wind");
            JsonNode clouds = root.path("clouds");
            JsonNode rain = root.path("rain");
            JsonNode weatherArray = root.path("weather");

            double temp = main.path("temp").asDouble(28.0);
            double feelsLike = main.path("feels_like").asDouble(temp);
            double minTemp = main.path("temp_min").asDouble(temp - 3);
            double maxTemp = main.path("temp_max").asDouble(temp + 3);
            int humidity = main.path("humidity").asInt(60);
            double pressure = main.path("pressure").asDouble(1013.0);
            double windSpeed = wind.path("speed").asDouble(3.0) * 3.6; // m/s to km/h
            int windDir = wind.path("deg").asInt(180);
            int cloudCover = clouds.path("all").asInt(20);
            double precipitation = rain.has("1h") ? rain.path("1h").asDouble(0.0) : 0.0;

            String conditionText = "Clear Sky";
            String icon = "bi-sun";
            int weatherCode = 0;

            if (weatherArray.isArray() && !weatherArray.isEmpty()) {
                JsonNode w0 = weatherArray.get(0);
                conditionText = w0.path("main").asText("Clear");
                String mainDesc = conditionText.toLowerCase();
                if (mainDesc.contains("rain") || mainDesc.contains("drizzle")) {
                    icon = "bi-cloud-rain";
                    weatherCode = 61;
                } else if (mainDesc.contains("cloud")) {
                    icon = "bi-cloud-sun";
                    weatherCode = 2;
                } else if (mainDesc.contains("thunder")) {
                    icon = "bi-cloud-lightning-rain";
                    weatherCode = 95;
                } else {
                    icon = "bi-sun";
                    weatherCode = 0;
                }
            }

            return new WeatherData(
                    location,
                    state,
                    root.path("coord").path("lat").asDouble(19.0),
                    root.path("coord").path("lon").asDouble(74.0),
                    temp,
                    feelsLike,
                    minTemp,
                    maxTemp,
                    humidity,
                    precipitation,
                    windSpeed,
                    windDir,
                    pressure,
                    cloudCover,
                    weatherCode,
                    conditionText,
                    icon,
                    "OpenWeatherMap Live API",
                    true
            );
        } catch (Exception ex) {
            log.warn("Error parsing OpenWeatherMap response: {}", ex.getMessage());
            return null;
        }
    }

    private static class WmoInfo {
        String conditionText;
        String icon;

        WmoInfo(String conditionText, String icon) {
            this.conditionText = conditionText;
            this.icon = icon;
        }
    }

    private WmoInfo mapWmoCode(int code) {
        return switch (code) {
            case 0 -> new WmoInfo("Clear Sky", "bi-sun-fill text-warning");
            case 1 -> new WmoInfo("Mainly Clear", "bi-sun text-warning");
            case 2 -> new WmoInfo("Partly Cloudy", "bi-cloud-sun-fill text-secondary");
            case 3 -> new WmoInfo("Overcast", "bi-clouds-fill text-secondary");
            case 45, 48 -> new WmoInfo("Fog / Mist", "bi-cloud-fog2 text-info");
            case 51, 53, 55 -> new WmoInfo("Light Drizzle", "bi-cloud-drizzle-fill text-info");
            case 61, 63 -> new WmoInfo("Moderate Rain", "bi-cloud-rain-fill text-primary");
            case 65 -> new WmoInfo("Heavy Rain", "bi-cloud-rain-heavy-fill text-primary");
            case 80, 81, 82 -> new WmoInfo("Rain Showers", "bi-cloud-showers-heavy text-primary");
            case 95, 96, 99 -> new WmoInfo("Thunderstorm with Rain", "bi-cloud-lightning-rain-fill text-danger");
            default -> new WmoInfo("Normal Weather", "bi-cloud-sun text-secondary");
        };
    }
}
