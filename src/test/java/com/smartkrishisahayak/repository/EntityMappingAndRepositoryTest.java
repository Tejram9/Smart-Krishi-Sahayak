package com.smartkrishisahayak.repository;

import com.smartkrishisahayak.entity.*;
import com.smartkrishisahayak.entity.enums.MessageSender;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class EntityMappingAndRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerProfileRepository farmerProfileRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private VerifiedAgricultureContentRepository contentRepository;

    @Test
    @DisplayName("Test User and FarmerProfile 1-to-1 Relationship & Persistence")
    void testUserAndFarmerProfileMapping() {
        User user = new User("रमेश पाटील", "9876543210", "$2a$10$hash", PreferredLanguage.MR, UserRole.ROLE_FARMER);
        user.setEmail("ramesh.patil@example.com");

        FarmerProfile profile = new FarmerProfile(
                user, "Maharashtra", "Nashik", "Niphad", "Pimpalgaon",
                new BigDecimal("4.50"), "Grapes, Onion", "Black Soil"
        );
        user.setFarmerProfile(profile);

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getFullName()).isEqualTo("रमेश पाटील");
        assertThat(savedUser.getFarmerProfile()).isNotNull();
        assertThat(savedUser.getFarmerProfile().getDistrict()).isEqualTo("Nashik");

        Optional<User> fetchedUserOpt = userRepository.findByMobileNumber("9876543210");
        assertThat(fetchedUserOpt).isPresent();
        assertThat(fetchedUserOpt.get().getPreferredLanguage()).isEqualTo(PreferredLanguage.MR);
    }

    @Test
    @DisplayName("Test User, ChatSession, and ChatMessage Relationships & Unicode (Marathi/Hindi)")
    void testChatSessionAndMessagesMapping() {
        User user = new User("अनिल कुमार", "9123456789", "$2a$10$hash", PreferredLanguage.HI, UserRole.ROLE_FARMER);
        userRepository.save(user);

        ChatSession session = new ChatSession(user, "कपास की खेती की सलाह", PreferredLanguage.HI);
        user.addChatSession(session);

        ChatMessage userMsg = new ChatMessage(session, MessageSender.USER, "कपास में कीट नियंत्रण कैसे करें?", PreferredLanguage.HI);
        ChatMessage aiMsg = new ChatMessage(session, MessageSender.AI, "कपास में कीट नियंत्रण के लिए नीम तेल का छिड़काव करें।", PreferredLanguage.HI);
        
        session.addMessage(userMsg);
        session.addMessage(aiMsg);

        ChatSession savedSession = chatSessionRepository.save(session);
        assertThat(savedSession.getId()).isNotNull();
        assertThat(savedSession.getSessionTitle()).isEqualTo("कपास की खेती की सलाह");

        List<ChatMessage> messages = chatMessageRepository.findByChatSessionIdOrderByTimestampAsc(savedSession.getId());
        assertThat(messages).hasSize(2);
        assertThat(messages.get(0).getMessageText()).contains("कीट नियंत्रण");
        assertThat(messages.get(1).getSender()).isEqualTo(MessageSender.AI);
    }

    @Test
    @DisplayName("Test Crop Catalog & Multilingual Search Queries")
    void testCropRepositoryMultilingualSearch() {
        Crop cotton = new Crop("Cotton", "कापूस", "कपास", "Commercial", "Kharif", "Black Soil", "Medium", "Cotton crop guide.");
        Crop wheat = new Crop("Wheat", "गहू", "गेहूं", "Cereals", "Rabi", "Alluvial Soil", "High", "Wheat crop guide.");
        cropRepository.saveAll(List.of(cotton, wheat));

        List<Crop> searchResultEn = cropRepository.searchCropsByKeyword("Cotton");
        assertThat(searchResultEn).hasSize(1);
        assertThat(searchResultEn.get(0).getNameMr()).isEqualTo("कापूस");

        List<Crop> searchResultMr = cropRepository.searchCropsByKeyword("गहू");
        assertThat(searchResultMr).hasSize(1);
        assertThat(searchResultMr.get(0).getNameEn()).isEqualTo("Wheat");
    }

    @Test
    @DisplayName("Test VerifiedAgricultureContent Relationship with Crop and Admin User")
    void testVerifiedAgricultureContentMapping() {
        User admin = new User("System Admin", "9999999999", "$2a$10$hash", PreferredLanguage.EN, UserRole.ROLE_ADMIN);
        userRepository.save(admin);

        Crop crop = new Crop("Grapes", "द्राक्ष", "अंगूर", "Fruits", "Perennial", "Light to Medium", "High", "Grapes cultivation.");
        cropRepository.save(crop);

        VerifiedAgricultureContent article = new VerifiedAgricultureContent(
                crop, admin, "द्राक्षावरील भुरी रोग व्यवस्थापन",
                "द्राक्षावरील भुरी रोगाच्या नियंत्रणासाठी गंधकाची फवारणी करावी.",
                "Pest Control", PreferredLanguage.MR, true
        );

        contentRepository.save(article);

        List<VerifiedAgricultureContent> publishedArticles = contentRepository.findByIsPublishedTrue();
        assertThat(publishedArticles).hasSize(1);
        assertThat(publishedArticles.get(0).getTitle()).isEqualTo("द्राक्षावरील भुरी रोग व्यवस्थापन");
    }
}
