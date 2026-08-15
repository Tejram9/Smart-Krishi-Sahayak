package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.CropDetailResponse;
import com.smartkrishisahayak.dto.response.CropSummaryResponse;

import java.util.List;

public interface CropService {

    /**
     * Retrieve a filtered or searched list of crop summaries.
     *
     * @param keyword  optional search keyword across multilingual names
     * @param category optional crop category filter (e.g. Cereals, Pulses, Commercial, Vegetables)
     * @param season   optional suitable season filter (e.g. Kharif, Rabi, Zaid, Perennial)
     * @param language optional preferred language code (EN, MR, HI)
     * @return list of crop summary responses
     */
    List<CropSummaryResponse> getCrops(String keyword, String category, String season, String language);

    /**
     * Retrieve full details of a crop along with its verified published agriculture guidance.
     *
     * @param id       crop ID
     * @param language optional preferred language code (EN, MR, HI)
     * @return crop detail response with verified advisory articles
     */
    CropDetailResponse getCropById(Long id, String language);
}
