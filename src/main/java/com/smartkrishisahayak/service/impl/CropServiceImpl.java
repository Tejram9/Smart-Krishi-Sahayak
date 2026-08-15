package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.response.AgricultureContentResponse;
import com.smartkrishisahayak.dto.response.CropDetailResponse;
import com.smartkrishisahayak.dto.response.CropSummaryResponse;
import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.CropRepository;
import com.smartkrishisahayak.repository.VerifiedAgricultureContentRepository;
import com.smartkrishisahayak.service.CropService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CropServiceImpl implements CropService {

    private static final Logger log = LoggerFactory.getLogger(CropServiceImpl.class);

    private final CropRepository cropRepository;
    private final VerifiedAgricultureContentRepository contentRepository;

    @Autowired
    public CropServiceImpl(CropRepository cropRepository, VerifiedAgricultureContentRepository contentRepository) {
        this.cropRepository = cropRepository;
        this.contentRepository = contentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CropSummaryResponse> getCrops(String keyword, String category, String season, String language) {
        log.debug("Fetching crops with keyword: {}, category: {}, season: {}, language: {}", keyword, category, season, language);

        List<Crop> crops;
        if (keyword != null && !keyword.trim().isEmpty()) {
            crops = cropRepository.searchCropsByKeyword(keyword.trim());
        } else if (category != null && !category.trim().isEmpty()) {
            crops = cropRepository.findByCategory(category.trim());
        } else {
            crops = cropRepository.findAll();
        }

        // Additional in-memory filtering for category/season if keyword search was combined with filters
        if (category != null && !category.trim().isEmpty() && keyword != null && !keyword.trim().isEmpty()) {
            crops = crops.stream()
                    .filter(c -> c.getCategory() != null && c.getCategory().equalsIgnoreCase(category.trim()))
                    .collect(Collectors.toList());
        }

        if (season != null && !season.trim().isEmpty()) {
            crops = crops.stream()
                    .filter(c -> c.getSuitableSeason() != null && c.getSuitableSeason().equalsIgnoreCase(season.trim()))
                    .collect(Collectors.toList());
        }

        return crops.stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CropDetailResponse getCropById(Long id, String language) {
        log.debug("Fetching crop details for ID: {} and language: {}", id, language);

        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", "id", id));

        List<VerifiedAgricultureContent> publishedContents = contentRepository.findByCropIdAndIsPublishedTrue(id);

        List<AgricultureContentResponse> contentResponses = filterAndSortContentByLanguage(publishedContents, language);

        return mapToDetailResponse(crop, contentResponses);
    }

    private List<AgricultureContentResponse> filterAndSortContentByLanguage(
            List<VerifiedAgricultureContent> contents, String languageStr) {
        if (contents == null || contents.isEmpty()) {
            return new ArrayList<>();
        }

        PreferredLanguage requestedLang = parseLanguage(languageStr);

        // If a specific language is requested (e.g. MR or HI)
        if (requestedLang != null) {
            List<VerifiedAgricultureContent> matchingLang = contents.stream()
                    .filter(c -> c.getLanguage() == requestedLang)
                    .collect(Collectors.toList());

            // If we found content in the requested language, return it plus any English content for categories not covered
            if (!matchingLang.isEmpty()) {
                List<String> coveredCategories = matchingLang.stream()
                        .map(c -> c.getCategory() != null ? c.getCategory().toLowerCase() : "")
                        .collect(Collectors.toList());

                List<VerifiedAgricultureContent> fallbackContent = contents.stream()
                        .filter(c -> c.getLanguage() == PreferredLanguage.EN &&
                                (c.getCategory() == null || !coveredCategories.contains(c.getCategory().toLowerCase())))
                        .collect(Collectors.toList());

                List<VerifiedAgricultureContent> combined = new ArrayList<>(matchingLang);
                combined.addAll(fallbackContent);

                return combined.stream()
                        .map(this::mapToContentResponse)
                        .collect(Collectors.toList());
            }
        }

        // Default: Sort so that EN or requested language comes first, and map to responses
        return contents.stream()
                .sorted(Comparator.comparing(VerifiedAgricultureContent::getId))
                .map(this::mapToContentResponse)
                .collect(Collectors.toList());
    }

    private PreferredLanguage parseLanguage(String languageStr) {
        if (languageStr == null || languageStr.trim().isEmpty()) {
            return null;
        }
        try {
            return PreferredLanguage.valueOf(languageStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private CropSummaryResponse mapToSummaryResponse(Crop crop) {
        return new CropSummaryResponse(
                crop.getId(),
                crop.getNameEn(),
                crop.getNameMr(),
                crop.getNameHi(),
                crop.getCategory(),
                crop.getSuitableSeason(),
                crop.getSoilRequirements(),
                crop.getWaterRequirement(),
                crop.getDescription(),
                crop.getCreatedAt(),
                crop.getUpdatedAt()
        );
    }

    private CropDetailResponse mapToDetailResponse(Crop crop, List<AgricultureContentResponse> contents) {
        return new CropDetailResponse(
                crop.getId(),
                crop.getNameEn(),
                crop.getNameMr(),
                crop.getNameHi(),
                crop.getCategory(),
                crop.getSuitableSeason(),
                crop.getSoilRequirements(),
                crop.getWaterRequirement(),
                crop.getDescription(),
                crop.getCreatedAt(),
                crop.getUpdatedAt(),
                contents
        );
    }

    private AgricultureContentResponse mapToContentResponse(VerifiedAgricultureContent content) {
        return new AgricultureContentResponse(
                content.getId(),
                content.getTitle(),
                content.getContentBody(),
                content.getCategory(),
                content.getLanguage(),
                content.getCreatedAt(),
                content.getUpdatedAt()
        );
    }
}
