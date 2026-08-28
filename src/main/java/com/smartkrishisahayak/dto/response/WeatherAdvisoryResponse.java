package com.smartkrishisahayak.dto.response;

import java.util.List;

public class WeatherAdvisoryResponse {

    private String location;
    private String state;
    private String currentSeason;
    private String temperature;
    private Double tempCelsius;
    private Double feelsLikeCelsius;
    private Double minTempCelsius;
    private Double maxTempCelsius;
    private String humidity;
    private Integer humidityPercent;
    private String rainfallForecast;
    private Double precipitationMm;
    private String windSpeed;
    private Double windSpeedKmh;
    private String windDirection;
    private Double pressureHpa;
    private Integer cloudCoverPercent;
    private String weatherCondition;
    private String weatherIcon;
    private String generalAdvisory;
    private List<String> pestDiseaseAlerts;
    private List<String> fieldWorkRecommendations;
    private String provider;
    private boolean liveData;
    private String lastUpdated;

    public WeatherAdvisoryResponse() {}

    public WeatherAdvisoryResponse(String location, String state, String currentSeason,
                                   String temperature, String humidity, String rainfallForecast,
                                   String weatherCondition, String generalAdvisory,
                                   List<String> pestDiseaseAlerts, List<String> fieldWorkRecommendations) {
        this.location = location;
        this.state = state;
        this.currentSeason = currentSeason;
        this.temperature = temperature;
        this.humidity = humidity;
        this.rainfallForecast = rainfallForecast;
        this.weatherCondition = weatherCondition;
        this.generalAdvisory = generalAdvisory;
        this.pestDiseaseAlerts = pestDiseaseAlerts;
        this.fieldWorkRecommendations = fieldWorkRecommendations;
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

    public String getCurrentSeason() {
        return currentSeason;
    }

    public void setCurrentSeason(String currentSeason) {
        this.currentSeason = currentSeason;
    }

    public String getTemperature() {
        return temperature;
    }

    public void setTemperature(String temperature) {
        this.temperature = temperature;
    }

    public Double getTempCelsius() {
        return tempCelsius;
    }

    public void setTempCelsius(Double tempCelsius) {
        this.tempCelsius = tempCelsius;
    }

    public Double getFeelsLikeCelsius() {
        return feelsLikeCelsius;
    }

    public void setFeelsLikeCelsius(Double feelsLikeCelsius) {
        this.feelsLikeCelsius = feelsLikeCelsius;
    }

    public Double getMinTempCelsius() {
        return minTempCelsius;
    }

    public void setMinTempCelsius(Double minTempCelsius) {
        this.minTempCelsius = minTempCelsius;
    }

    public Double getMaxTempCelsius() {
        return maxTempCelsius;
    }

    public void setMaxTempCelsius(Double maxTempCelsius) {
        this.maxTempCelsius = maxTempCelsius;
    }

    public String getHumidity() {
        return humidity;
    }

    public void setHumidity(String humidity) {
        this.humidity = humidity;
    }

    public Integer getHumidityPercent() {
        return humidityPercent;
    }

    public void setHumidityPercent(Integer humidityPercent) {
        this.humidityPercent = humidityPercent;
    }

    public String getRainfallForecast() {
        return rainfallForecast;
    }

    public void setRainfallForecast(String rainfallForecast) {
        this.rainfallForecast = rainfallForecast;
    }

    public Double getPrecipitationMm() {
        return precipitationMm;
    }

    public void setPrecipitationMm(Double precipitationMm) {
        this.precipitationMm = precipitationMm;
    }

    public String getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(String windSpeed) {
        this.windSpeed = windSpeed;
    }

    public Double getWindSpeedKmh() {
        return windSpeedKmh;
    }

    public void setWindSpeedKmh(Double windSpeedKmh) {
        this.windSpeedKmh = windSpeedKmh;
    }

    public String getWindDirection() {
        return windDirection;
    }

    public void setWindDirection(String windDirection) {
        this.windDirection = windDirection;
    }

    public Double getPressureHpa() {
        return pressureHpa;
    }

    public void setPressureHpa(Double pressureHpa) {
        this.pressureHpa = pressureHpa;
    }

    public Integer getCloudCoverPercent() {
        return cloudCoverPercent;
    }

    public void setCloudCoverPercent(Integer cloudCoverPercent) {
        this.cloudCoverPercent = cloudCoverPercent;
    }

    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    public String getWeatherIcon() {
        return weatherIcon;
    }

    public void setWeatherIcon(String weatherIcon) {
        this.weatherIcon = weatherIcon;
    }

    public String getGeneralAdvisory() {
        return generalAdvisory;
    }

    public void setGeneralAdvisory(String generalAdvisory) {
        this.generalAdvisory = generalAdvisory;
    }

    public List<String> getPestDiseaseAlerts() {
        return pestDiseaseAlerts;
    }

    public void setPestDiseaseAlerts(List<String> pestDiseaseAlerts) {
        this.pestDiseaseAlerts = pestDiseaseAlerts;
    }

    public List<String> getFieldWorkRecommendations() {
        return fieldWorkRecommendations;
    }

    public void setFieldWorkRecommendations(List<String> fieldWorkRecommendations) {
        this.fieldWorkRecommendations = fieldWorkRecommendations;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isLiveData() {
        return liveData;
    }

    public void setLiveData(boolean liveData) {
        this.liveData = liveData;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
