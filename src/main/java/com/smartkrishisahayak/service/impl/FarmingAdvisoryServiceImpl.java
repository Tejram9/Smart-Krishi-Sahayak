package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.request.CropRecommendationRequest;
import com.smartkrishisahayak.dto.response.CropRecommendationResponse;
import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;
import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.repository.CropRepository;
import com.smartkrishisahayak.service.FarmingAdvisoryService;
import com.smartkrishisahayak.service.WeatherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FarmingAdvisoryServiceImpl implements FarmingAdvisoryService {

    private static final Logger log = LoggerFactory.getLogger(FarmingAdvisoryServiceImpl.class);

    private final CropRepository cropRepository;
    private final WeatherService weatherService;

    @Autowired
    public FarmingAdvisoryServiceImpl(CropRepository cropRepository, WeatherService weatherService) {
        this.cropRepository = cropRepository;
        this.weatherService = weatherService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CropRecommendationResponse> recommendCrops(CropRecommendationRequest request) {
        log.info("Calculating crop recommendations for season={}, soilType={}, water={}, lang={}",
                request.getSeason(), request.getSoilType(), request.getWaterAvailability(), request.getLanguage());

        List<Crop> allCrops = cropRepository.findAll();
        String reqSeason = request.getSeason() != null ? request.getSeason().trim().toLowerCase() : "";
        String reqSoil = request.getSoilType() != null ? request.getSoilType().trim().toLowerCase() : "";
        String reqWater = request.getWaterAvailability() != null ? request.getWaterAvailability().trim().toLowerCase() : "";
        String lang = request.getLanguage() != null ? request.getLanguage().trim().toUpperCase() : "EN";

        List<CropRecommendationResponse> recommendations = new ArrayList<>();

        for (Crop crop : allCrops) {
            int score = calculateSuitability(crop, reqSeason, reqSoil, reqWater);
            if (score >= 50) {
                String reason = buildRecommendationReason(crop, score, reqSeason, reqSoil, lang);
                recommendations.add(new CropRecommendationResponse(
                        crop.getId(),
                        crop.getNameEn(),
                        crop.getNameMr(),
                        crop.getNameHi(),
                        crop.getCategory(),
                        crop.getSuitableSeason(),
                        crop.getSoilRequirements(),
                        crop.getWaterRequirement(),
                        score,
                        reason
                ));
            }
        }

        // Sort descending by match percentage score
        recommendations.sort(Comparator.comparingInt(CropRecommendationResponse::getMatchPercentage).reversed());
        return recommendations;
    }

    @Override
    public WeatherAdvisoryResponse getWeatherAdvisory(String district, String state, String language) {
        return weatherService.getWeatherAdvisory(district, state, language);
    }

    private int calculateSuitability(Crop crop, String season, String soil, String water) {

        int score = 40; // Base score

        String cropSeason = crop.getSuitableSeason() != null ? crop.getSuitableSeason().toLowerCase() : "";
        String cropSoil = crop.getSoilRequirements() != null ? crop.getSoilRequirements().toLowerCase() : "";
        String cropWater = crop.getWaterRequirement() != null ? crop.getWaterRequirement().toLowerCase() : "";

        // Season match
        if (cropSeason.contains(season) || season.contains(cropSeason) || cropSeason.contains("perennial") || cropSeason.contains("all season")) {
            score += 25;
        } else if (cropSeason.contains("kharif") && season.contains("monsoon")) {
            score += 25;
        } else if (cropSeason.contains("rabi") && season.contains("winter")) {
            score += 25;
        }

        // Soil match
        if (soil.isEmpty() || cropSoil.contains(soil) || isCompatibleSoil(soil, cropSoil)) {
            score += 20;
        }

        // Water match
        if (water.isEmpty() || cropWater.contains(water) || isCompatibleWater(water, cropWater)) {
            score += 15;
        }

        return Math.min(score, 100);
    }

    private boolean isCompatibleSoil(String requestedSoil, String cropSoil) {
        if (requestedSoil.contains("black") && (cropSoil.contains("black") || cropSoil.contains("vertisol") || cropSoil.contains("clay") || cropSoil.contains("heavy"))) {
            return true;
        }
        if (requestedSoil.contains("loam") && (cropSoil.contains("loam") || cropSoil.contains("alluvial") || cropSoil.contains("well-drained"))) {
            return true;
        }
        if (requestedSoil.contains("sandy") && (cropSoil.contains("sandy") || cropSoil.contains("light") || cropSoil.contains("loam"))) {
            return true;
        }
        if (requestedSoil.contains("red") && (cropSoil.contains("red") || cropSoil.contains("laterite") || cropSoil.contains("loam"))) {
            return true;
        }
        return false;
    }

    private boolean isCompatibleWater(String requestedWater, String cropWater) {
        if (requestedWater.contains("high") && (cropWater.contains("high") || cropWater.contains("medium"))) return true;
        if (requestedWater.contains("medium") && (cropWater.contains("medium") || cropWater.contains("moderate"))) return true;
        if (requestedWater.contains("low") && (cropWater.contains("low") || cropWater.contains("drought") || cropWater.contains("rainfed"))) return true;
        if (requestedWater.contains("rainfed") && (cropWater.contains("rainfed") || cropWater.contains("low") || cropWater.contains("medium"))) return true;
        return false;
    }

    private String buildRecommendationReason(Crop crop, int score, String season, String soil, String language) {
        if ("MR".equals(language)) {
            return String.format("%s हे पीक %s हंगामासाठी आणि %s जमिनीसाठी अत्यंत अनुकूल आहे (अनुकूलता निर्देशांक: %d%%).",
                    crop.getNameMr() != null ? crop.getNameMr() : crop.getNameEn(),
                    crop.getSuitableSeason(),
                    soil.isEmpty() ? "स्थानिक" : soil,
                    score);
        } else if ("HI".equals(language)) {
            return String.format("%s फसल %s मौसम और %s मिट्टी के लिए बहुत उपयुक्त है (सटीकता स्कोर: %d%%).",
                    crop.getNameHi() != null ? crop.getNameHi() : crop.getNameEn(),
                    crop.getSuitableSeason(),
                    soil.isEmpty() ? "स्थानीय" : soil,
                    score);
        } else {
            return String.format("%s is highly suitable for %s season and %s soil conditions (Suitability: %d%%).",
                    crop.getNameEn(),
                    crop.getSuitableSeason(),
                    soil.isEmpty() ? "local" : soil,
                    score);
        }
    }
}
