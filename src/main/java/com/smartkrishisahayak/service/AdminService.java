package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.request.CropCreateUpdateRequest;
import com.smartkrishisahayak.dto.request.GuidanceCreateUpdateRequest;
import com.smartkrishisahayak.dto.response.AdminChatQueryResponse;
import com.smartkrishisahayak.dto.response.AdminStatsResponse;
import com.smartkrishisahayak.dto.response.AdminUserResponse;
import com.smartkrishisahayak.dto.response.AgricultureContentResponse;
import com.smartkrishisahayak.dto.response.CropDetailResponse;

import java.util.List;

public interface AdminService {

    List<AdminUserResponse> getAllUsers(String search);

    AdminUserResponse toggleUserStatus(Long userId);

    CropDetailResponse createCrop(CropCreateUpdateRequest request);

    CropDetailResponse updateCrop(Long cropId, CropCreateUpdateRequest request);

    void deleteCrop(Long cropId);

    AgricultureContentResponse createGuidance(Long cropId, GuidanceCreateUpdateRequest request, Long adminId);

    AgricultureContentResponse updateGuidance(Long guidanceId, GuidanceCreateUpdateRequest request);

    void deleteGuidance(Long guidanceId);

    List<AdminChatQueryResponse> getChatQueries(int limit);

    AdminStatsResponse getSystemStats();
}
