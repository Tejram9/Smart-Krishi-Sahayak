package com.smartkrishisahayak.service;

import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.CropRepository;
import com.smartkrishisahayak.repository.VerifiedAgricultureContentRepository;
import com.smartkrishisahayak.service.impl.AgricultureKnowledgeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgricultureKnowledgeServiceTest {

    @Mock
    private CropRepository cropRepository;

    @Mock
    private VerifiedAgricultureContentRepository contentRepository;

    @InjectMocks
    private AgricultureKnowledgeServiceImpl knowledgeService;

    private Crop cotton;
    private Crop wheat;
    private Crop soybean;
    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User("Admin", "9999999999", "hashedPass", PreferredLanguage.EN, UserRole.ROLE_ADMIN);
        adminUser.setId(1L);

        cotton = new Crop("Cotton", "कापूस", "कपास", "Commercial", "Kharif", "Black Soil", "Medium", "Cotton crop");
        cotton.setId(10L);

        wheat = new Crop("Wheat", "गहू", "गेहूं", "Cereals", "Rabi", "Clay Loam", "Medium", "Wheat crop");
        wheat.setId(20L);

        soybean = new Crop("Soybean", "सोयाबीन", "सोयाबीन", "Commercial", "Kharif", "Black soil", "Medium", "Soybean crop");
        soybean.setId(30L);
    }

    @Test
    @DisplayName("Test 1: English question identifies cotton and retrieves cotton verified content")
    void englishCottonQuery_retrievesCottonContent() {
        VerifiedAgricultureContent cottonPestEn = new VerifiedAgricultureContent(
                cotton, adminUser, "Pink Bollworm IPM", "Use pheromone traps @ 5/ha", "Pest Control", PreferredLanguage.EN, true
        );
        cottonPestEn.setId(101L);

        when(cropRepository.findAll()).thenReturn(Arrays.asList(cotton, wheat, soybean));
        when(contentRepository.findByCropIdAndIsPublishedTrue(10L)).thenReturn(Collections.singletonList(cottonPestEn));

        List<Crop> identifiedCrops = knowledgeService.identifyRelevantCrops("What pest control tips do you have for cotton?");
        assertThat(identifiedCrops).hasSize(1);
        assertThat(identifiedCrops.get(0).getNameEn()).isEqualTo("Cotton");

        String context = knowledgeService.buildGroundedContext("What pest control tips do you have for cotton?", PreferredLanguage.EN);
        assertThat(context).isNotNull();
        assertThat(context).contains("Crop: Cotton");
        assertThat(context).contains("Pink Bollworm IPM");
        assertThat(context).contains("Use pheromone traps");
    }

    @Test
    @DisplayName("Test 2: Marathi query with inflected crop name matches Marathi crop and prioritizes Marathi content")
    void marathiQuery_matchesCropAndPrioritizesMarathi() {
        VerifiedAgricultureContent cottonFertEn = new VerifiedAgricultureContent(
                cotton, adminUser, "Balanced Fertilizer for Cotton", "Apply 100:50:50 NPK", "Fertilizer Management", PreferredLanguage.EN, true
        );
        cottonFertEn.setId(102L);

        VerifiedAgricultureContent cottonFertMr = new VerifiedAgricultureContent(
                cotton, adminUser, "कापूस खत व्यवस्थापन", "हेक्टरी १००:५०:५० नत्र, स्फुरद व पालाश खते द्यावीत", "Fertilizer Management", PreferredLanguage.MR, true
        );
        cottonFertMr.setId(103L);

        when(cropRepository.findAll()).thenReturn(Arrays.asList(cotton, wheat, soybean));
        when(contentRepository.findByCropIdAndIsPublishedTrue(10L)).thenReturn(Arrays.asList(cottonFertEn, cottonFertMr));

        List<Crop> matched = knowledgeService.identifyRelevantCrops("कापसासाठी खत व्यवस्थापन काय आहे?");
        assertThat(matched).extracting(Crop::getNameMr).contains("कापूस");

        List<VerifiedAgricultureContent> content = knowledgeService.findRelevantContent("कापसासाठी खत व्यवस्थापन काय आहे?", PreferredLanguage.MR);
        assertThat(content).isNotEmpty();
        // Preferred Marathi content should be ordered first
        assertThat(content.get(0).getLanguage()).isEqualTo(PreferredLanguage.MR);
        assertThat(content.get(0).getTitle()).isEqualTo("कापूस खत व्यवस्थापन");
    }

    @Test
    @DisplayName("Test 3: Hindi crop query identifies matching crop and retrieves Hindi verified content")
    void hindiQuery_matchesWheatAndRetrievesHindiContent() {
        VerifiedAgricultureContent wheatIrrigationHi = new VerifiedAgricultureContent(
                wheat, adminUser, "गेहूं में सिंचाई प्रबंधन", "मुकुट जड़ अवस्था (२१ दिन) पर पहली सिंचाई करें।", "Irrigation", PreferredLanguage.HI, true
        );
        wheatIrrigationHi.setId(201L);

        when(cropRepository.findAll()).thenReturn(Arrays.asList(cotton, wheat, soybean));
        when(contentRepository.findByCropIdAndIsPublishedTrue(20L)).thenReturn(Collections.singletonList(wheatIrrigationHi));

        List<Crop> matched = knowledgeService.identifyRelevantCrops("गेहूं की बुवाई और सिंचाई के बारे में जानकारी बताइए");
        assertThat(matched).extracting(Crop::getNameHi).contains("गेहूं");

        String context = knowledgeService.buildGroundedContext("गेहूं की सिंचाई", PreferredLanguage.HI);
        assertThat(context).isNotNull();
        assertThat(context).contains("गेहूं में सिंचाई प्रबंधन");
        assertThat(context).contains("मुकुट जड़ अवस्था");
    }

    @Test
    @DisplayName("Test 4: Unpublished content is strictly filtered out and never returned")
    void unpublishedContent_isNeverRetrieved() {
        // findByCropIdAndIsPublishedTrue ensures only published content is returned by repository
        when(cropRepository.findAll()).thenReturn(Collections.singletonList(cotton));
        when(contentRepository.findByCropIdAndIsPublishedTrue(10L)).thenReturn(Collections.emptyList());

        String context = knowledgeService.buildGroundedContext("Cotton growth tips", PreferredLanguage.EN);
        assertThat(context).isNull();
    }

    @Test
    @DisplayName("Test 5: Topic filter retrieves relevant topic content (e.g. Pest Control vs Fertilizer)")
    void topicFilter_selectsRelevantCategory() {
        VerifiedAgricultureContent cottonPest = new VerifiedAgricultureContent(
                cotton, adminUser, "Pink Bollworm IPM", "Neem oil spray @ 5ml/L", "Pest Control", PreferredLanguage.EN, true
        );
        cottonPest.setId(104L);

        VerifiedAgricultureContent cottonFert = new VerifiedAgricultureContent(
                cotton, adminUser, "Fertilizer Schedule", "NPK 100:50:50", "Fertilizer Management", PreferredLanguage.EN, true
        );
        cottonFert.setId(105L);

        when(cropRepository.findAll()).thenReturn(Collections.singletonList(cotton));
        when(contentRepository.findByCropIdAndIsPublishedTrue(10L)).thenReturn(Arrays.asList(cottonPest, cottonFert));

        List<VerifiedAgricultureContent> results = knowledgeService.findRelevantContent("How to control bollworm pests in cotton?", PreferredLanguage.EN);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Pink Bollworm IPM");
    }

    @Test
    @DisplayName("Test 6: Context does not contain unrelated crop information")
    void context_doesNotContainUnrelatedCropInfo() {
        VerifiedAgricultureContent wheatAdvisory = new VerifiedAgricultureContent(
                wheat, adminUser, "Wheat Irrigation", "Critical CRI stage", "Irrigation", PreferredLanguage.EN, true
        );
        wheatAdvisory.setId(202L);

        when(cropRepository.findAll()).thenReturn(Arrays.asList(cotton, wheat));
        when(contentRepository.findByCropIdAndIsPublishedTrue(20L)).thenReturn(Collections.singletonList(wheatAdvisory));

        String context = knowledgeService.buildGroundedContext("Tell me about wheat watering", PreferredLanguage.EN);
        assertThat(context).contains("Wheat");
        assertThat(context).doesNotContain("Cotton");
        assertThat(context).doesNotContain("Pink Bollworm");
    }

    @Test
    @DisplayName("Test 7: Unsupported crop query returns safe null context without crashing")
    void unsupportedCrop_returnsNullContextSafely() {
        when(cropRepository.findAll()).thenReturn(Arrays.asList(cotton, wheat, soybean));
        when(contentRepository.searchPublishedContentByKeyword(anyString())).thenReturn(Collections.emptyList());

        String context = knowledgeService.buildGroundedContext("How to grow dragon fruit in Maharashtra?", PreferredLanguage.EN);
        assertThat(context).isNull();
    }

    @Test
    @DisplayName("Test 8: Blank, null, or empty user query handled safely")
    void blankQuery_returnsEmptyResultsSafely() {
        assertThat(knowledgeService.buildGroundedContext("", PreferredLanguage.EN)).isNull();
        assertThat(knowledgeService.buildGroundedContext(null, PreferredLanguage.MR)).isNull();
        assertThat(knowledgeService.findRelevantContent("   ", PreferredLanguage.HI)).isEmpty();
        assertThat(knowledgeService.identifyRelevantCrops("")).isEmpty();
    }
}
