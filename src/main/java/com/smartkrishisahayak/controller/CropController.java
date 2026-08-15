package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.CropDetailResponse;
import com.smartkrishisahayak.dto.response.CropSummaryResponse;
import com.smartkrishisahayak.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/crops")
public class CropController {

    private final CropService cropService;

    @Autowired
    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    /**
     * Get a list of crops with optional keyword search and category/season/language filters.
     *
     * @param keyword  search term
     * @param category category filter (e.g. Cereals, Pulses, Commercial, Vegetables, Fruits)
     * @param season   season filter (e.g. Kharif, Rabi, Zaid, Perennial)
     * @param language preferred language (EN, MR, HI)
     * @return list of crop summaries
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CropSummaryResponse>>> getAllCrops(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String language) {
        List<CropSummaryResponse> crops = cropService.getCrops(keyword, category, season, language);
        return ResponseEntity.ok(ApiResponse.success("Crops retrieved successfully.", crops));
    }

    /**
     * Get detailed crop information and published verified agriculture guidance.
     *
     * @param id       crop ID
     * @param language preferred language (EN, MR, HI)
     * @return crop details with verified guidance
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CropDetailResponse>> getCropById(
            @PathVariable Long id,
            @RequestParam(required = false) String language) {
        CropDetailResponse cropDetail = cropService.getCropById(id, language);
        return ResponseEntity.ok(ApiResponse.success("Crop details retrieved successfully.", cropDetail));
    }
}
