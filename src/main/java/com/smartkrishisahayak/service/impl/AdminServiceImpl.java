package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.request.CropCreateUpdateRequest;
import com.smartkrishisahayak.dto.request.GuidanceCreateUpdateRequest;
import com.smartkrishisahayak.dto.response.*;
import com.smartkrishisahayak.entity.ChatMessage;
import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.FarmerProfile;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.MessageSender;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.exception.ResourceNotFoundException;
import com.smartkrishisahayak.repository.ChatMessageRepository;
import com.smartkrishisahayak.repository.CropRepository;
import com.smartkrishisahayak.repository.FarmerProfileRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.repository.VerifiedAgricultureContentRepository;
import com.smartkrishisahayak.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final CropRepository cropRepository;
    private final VerifiedAgricultureContentRepository contentRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Autowired
    public AdminServiceImpl(UserRepository userRepository,
                            FarmerProfileRepository farmerProfileRepository,
                            CropRepository cropRepository,
                            VerifiedAgricultureContentRepository contentRepository,
                            ChatMessageRepository chatMessageRepository) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.cropRepository = cropRepository;
        this.contentRepository = contentRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers(String search) {
        log.debug("Fetching users list for admin, search query: '{}'", search);
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(u -> matchesSearch(u, search))
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdminUserResponse toggleUserStatus(Long userId) {
        log.info("Admin toggling enabled status for user ID={}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setEnabled(!user.isEnabled());
        User saved = userRepository.save(user);
        return mapToAdminUserResponse(saved);
    }

    @Override
    @Transactional
    public CropDetailResponse createCrop(CropCreateUpdateRequest request) {
        log.info("Admin creating new crop: {}", request.getNameEn());
        Crop crop = new Crop(
                request.getNameEn().trim(),
                request.getNameMr().trim(),
                request.getNameHi().trim(),
                request.getCategory().trim(),
                request.getSuitableSeason().trim(),
                request.getSoilRequirements(),
                request.getWaterRequirement(),
                request.getDescription()
        );
        Crop saved = cropRepository.save(crop);
        return mapToCropDetailResponse(saved, Collections.emptyList());
    }

    @Override
    @Transactional
    public CropDetailResponse updateCrop(Long cropId, CropCreateUpdateRequest request) {
        log.info("Admin updating crop ID={}", cropId);
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", "id", cropId));

        crop.setNameEn(request.getNameEn().trim());
        crop.setNameMr(request.getNameMr().trim());
        crop.setNameHi(request.getNameHi().trim());
        crop.setCategory(request.getCategory().trim());
        crop.setSuitableSeason(request.getSuitableSeason().trim());
        crop.setSoilRequirements(request.getSoilRequirements());
        crop.setWaterRequirement(request.getWaterRequirement());
        crop.setDescription(request.getDescription());

        Crop updated = cropRepository.save(crop);
        List<VerifiedAgricultureContent> contents = contentRepository.findByCropId(cropId);
        List<AgricultureContentResponse> contentResponses = contents.stream()
                .map(this::mapToContentResponse)
                .collect(Collectors.toList());

        return mapToCropDetailResponse(updated, contentResponses);
    }

    @Override
    @Transactional
    public void deleteCrop(Long cropId) {
        log.info("Admin deleting crop ID={}", cropId);
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", "id", cropId));

        List<VerifiedAgricultureContent> contents = contentRepository.findByCropId(cropId);
        if (!contents.isEmpty()) {
            contentRepository.deleteAll(contents);
        }
        cropRepository.delete(crop);
    }

    @Override
    @Transactional
    public AgricultureContentResponse createGuidance(Long cropId, GuidanceCreateUpdateRequest request, Long adminId) {
        log.info("Admin ID={} creating verified guidance for crop ID={}", adminId, cropId);
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", "id", cropId));

        User author = (adminId != null) ? userRepository.findById(adminId).orElse(null) : null;

        VerifiedAgricultureContent content = new VerifiedAgricultureContent(
                crop,
                author,
                request.getTitle().trim(),
                request.getContentBody().trim(),
                request.getCategory().trim(),
                request.getLanguage(),
                request.isPublished()
        );

        VerifiedAgricultureContent saved = contentRepository.save(content);
        return mapToContentResponse(saved);
    }

    @Override
    @Transactional
    public AgricultureContentResponse updateGuidance(Long guidanceId, GuidanceCreateUpdateRequest request) {
        log.info("Admin updating guidance ID={}", guidanceId);
        VerifiedAgricultureContent content = contentRepository.findById(guidanceId)
                .orElseThrow(() -> new ResourceNotFoundException("VerifiedAgricultureContent", "id", guidanceId));

        content.setTitle(request.getTitle().trim());
        content.setContentBody(request.getContentBody().trim());
        content.setCategory(request.getCategory().trim());
        content.setLanguage(request.getLanguage());
        content.setPublished(request.isPublished());

        VerifiedAgricultureContent updated = contentRepository.save(content);
        return mapToContentResponse(updated);
    }

    @Override
    @Transactional
    public void deleteGuidance(Long guidanceId) {
        log.info("Admin deleting guidance ID={}", guidanceId);
        VerifiedAgricultureContent content = contentRepository.findById(guidanceId)
                .orElseThrow(() -> new ResourceNotFoundException("VerifiedAgricultureContent", "id", guidanceId));
        contentRepository.delete(content);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminChatQueryResponse> getChatQueries(int limit) {
        int maxLimit = limit > 0 ? Math.min(limit, 200) : 50;
        List<ChatMessage> userMessages = chatMessageRepository.findBySenderOrderByTimestampDesc(MessageSender.USER);

        List<AdminChatQueryResponse> auditLogs = new ArrayList<>();
        for (ChatMessage userMsg : userMessages) {
            if (auditLogs.size() >= maxLimit) {
                break;
            }

            String aiResponseText = "";
            if (userMsg.getChatSession() != null) {
                List<ChatMessage> sessionMsgs = chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(userMsg.getChatSession().getId());
                int userMsgIndex = sessionMsgs.indexOf(userMsg);
                if (userMsgIndex >= 0 && userMsgIndex + 1 < sessionMsgs.size()) {
                    ChatMessage nextMsg = sessionMsgs.get(userMsgIndex + 1);
                    if (nextMsg.getSender() == MessageSender.AI) {
                        aiResponseText = nextMsg.getMessageText();
                    }
                }
            }

            User user = userMsg.getChatSession() != null ? userMsg.getChatSession().getUser() : null;
            String farmerName = user != null ? user.getFullName() : "Anonymous Farmer";
            String farmerMobile = user != null ? user.getMobileNumber() : "N/A";
            Long userId = user != null ? user.getId() : null;
            Long sessionId = userMsg.getChatSession() != null ? userMsg.getChatSession().getId() : null;

            auditLogs.add(new AdminChatQueryResponse(
                    userMsg.getId(),
                    sessionId,
                    userId,
                    farmerName,
                    farmerMobile,
                    userMsg.getMessageText(),
                    aiResponseText,
                    userMsg.getLanguage() != null ? userMsg.getLanguage().name() : "EN",
                    userMsg.getTimestamp()
            ));
        }

        return auditLogs;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getSystemStats() {
        log.debug("Generating system analytics stats for admin dashboard");

        long totalFarmers = userRepository.findByRole(UserRole.ROLE_FARMER).size();
        long totalQueriesAnswered = chatMessageRepository.countBySender(MessageSender.AI);
        long totalCropsManaged = cropRepository.count();
        long totalAdvisoriesPublished = contentRepository.count();

        // Language breakdown of registered users
        Map<String, Long> langMap = new HashMap<>();
        langMap.put("MR", 0L);
        langMap.put("HI", 0L);
        langMap.put("EN", 0L);

        for (User u : userRepository.findAll()) {
            if (u.getPreferredLanguage() != null) {
                String code = u.getPreferredLanguage().name();
                langMap.put(code, langMap.getOrDefault(code, 0L) + 1L);
            }
        }

        // Daily query activity for the past 7 days
        LocalDate today = LocalDate.now();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> dayCountMap = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            dayCountMap.put(day.format(dtf), 0L);
        }

        List<ChatMessage> allUserMsgs = chatMessageRepository.findBySenderOrderByTimestampDesc(MessageSender.USER);
        for (ChatMessage m : allUserMsgs) {
            if (m.getTimestamp() != null) {
                String dateStr = m.getTimestamp().toLocalDate().format(dtf);
                if (dayCountMap.containsKey(dateStr)) {
                    dayCountMap.put(dateStr, dayCountMap.get(dateStr) + 1L);
                }
            }
        }

        List<AdminStatsResponse.DailyQueryStat> recentQueriesPerDay = dayCountMap.entrySet().stream()
                .map(e -> new AdminStatsResponse.DailyQueryStat(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return new AdminStatsResponse(
                totalFarmers,
                totalQueriesAnswered,
                totalCropsManaged,
                totalAdvisoriesPublished,
                langMap,
                recentQueriesPerDay
        );
    }

    private boolean matchesSearch(User u, String search) {
        if (search == null || search.trim().isEmpty()) {
            return true;
        }
        String q = search.trim().toLowerCase();
        if (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) return true;
        if (u.getMobileNumber() != null && u.getMobileNumber().contains(q)) return true;
        if (u.getEmail() != null && u.getEmail().toLowerCase().contains(q)) return true;

        Optional<FarmerProfile> profile = farmerProfileRepository.findByUserId(u.getId());
        if (profile.isPresent()) {
            FarmerProfile p = profile.get();
            if (p.getDistrict() != null && p.getDistrict().toLowerCase().contains(q)) return true;
            if (p.getPrimaryCrops() != null && p.getPrimaryCrops().toLowerCase().contains(q)) return true;
            if (p.getVillage() != null && p.getVillage().toLowerCase().contains(q)) return true;
        }
        return false;
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        Optional<FarmerProfile> profileOpt = farmerProfileRepository.findByUserId(user.getId());
        FarmerProfile profile = profileOpt.orElse(null);

        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getMobileNumber(),
                user.getEmail(),
                user.getPreferredLanguage() != null ? user.getPreferredLanguage().name() : "EN",
                user.getRole() != null ? user.getRole().name() : "ROLE_FARMER",
                user.isEnabled(),
                profile != null ? profile.getState() : null,
                profile != null ? profile.getDistrict() : null,
                profile != null ? profile.getTaluka() : null,
                profile != null ? profile.getVillage() : null,
                (profile != null && profile.getLandSizeAcres() != null) ? profile.getLandSizeAcres().doubleValue() : null,
                profile != null ? profile.getPrimaryCrops() : null,
                profile != null ? profile.getSoilType() : null,
                user.getCreatedAt()
        );
    }

    private CropDetailResponse mapToCropDetailResponse(Crop crop, List<AgricultureContentResponse> contents) {
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
