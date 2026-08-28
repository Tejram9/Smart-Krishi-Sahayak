package com.smartkrishisahayak.dto.weather;

import java.time.LocalDateTime;

public class WeatherData {

    private String location;
    private String state;
    private Double latitude;
    private Double longitude;
    private Double temperature;
    private Double feelsLike;
    private Double minTemp;
    private Double maxTemp;
    private Integer humidity;
    private Double precipitation;
    private Double windSpeed;
    private Integer windDirection;
    private Double pressure;
    private Integer cloudCover;
    private Integer weatherCode;
    private String conditionText;
    private String weatherIcon;
    private String provider;
    private boolean isLive;
    private LocalDateTime timestamp;

    public WeatherData() {
        this.timestamp = LocalDateTime.now();
    }

    public WeatherData(String location, String state, Double latitude, Double longitude,
                       Double temperature, Double feelsLike, Double minTemp, Double maxTemp,
                       Integer humidity, Double precipitation, Double windSpeed, Integer windDirection,
                       Double pressure, Integer cloudCover, Integer weatherCode, String conditionText,
                       String weatherIcon, String provider, boolean isLive) {
        this.location = location;
        this.state = state;
        this.latitude = latitude;
        this.longitude = longitude;
        this.temperature = temperature;
        this.feelsLike = feelsLike;
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
        this.humidity = humidity;
        this.precipitation = precipitation;
        this.windSpeed = windSpeed;
        this.windDirection = windDirection;
        this.pressure = pressure;
        this.cloudCover = cloudCover;
        this.weatherCode = weatherCode;
        this.conditionText = conditionText;
        this.weatherIcon = weatherIcon;
        this.provider = provider;
        this.isLive = isLive;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getFeelsLike() {
        return feelsLike;
    }

    public void setFeelsLike(Double feelsLike) {
        this.feelsLike = feelsLike;
    }

    public Double getMinTemp() {
        return minTemp;
    }

    public void setMinTemp(Double minTemp) {
        this.minTemp = minTemp;
    }

    public Double getMaxTemp() {
        return maxTemp;
    }

    public void setMaxTemp(Double maxTemp) {
        this.maxTemp = maxTemp;
    }

    public Integer getHumidity() {
        return humidity;
    }

    public void setHumidity(Integer humidity) {
        this.humidity = humidity;
    }

    public Double getPrecipitation() {
        return precipitation;
    }

    public void setPrecipitation(Double precipitation) {
        this.precipitation = precipitation;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public Integer getWindDirection() {
        return windDirection;
    }

    public void setWindDirection(Integer windDirection) {
        this.windDirection = windDirection;
    }

    public Double getPressure() {
        return pressure;
    }

    public void setPressure(Double pressure) {
        this.pressure = pressure;
    }

    public Integer getCloudCover() {
        return cloudCover;
    }

    public void setCloudCover(Integer cloudCover) {
        this.cloudCover = cloudCover;
    }

    public Integer getWeatherCode() {
        return weatherCode;
    }

    public void setWeatherCode(Integer weatherCode) {
        this.weatherCode = weatherCode;
    }

    public String getConditionText() {
        return conditionText;
    }

    public void setConditionText(String conditionText) {
        this.conditionText = conditionText;
    }

    public String getWeatherIcon() {
        return weatherIcon;
    }

    public void setWeatherIcon(String weatherIcon) {
        this.weatherIcon = weatherIcon;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isLive() {
        return isLive;
    }

    public void setLive(boolean live) {
        isLive = live;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
