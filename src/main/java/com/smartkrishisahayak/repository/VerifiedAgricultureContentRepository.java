package com.smartkrishisahayak.repository;

import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerifiedAgricultureContentRepository extends JpaRepository<VerifiedAgricultureContent, Long> {
    List<VerifiedAgricultureContent> findByCropId(Long cropId);
    List<VerifiedAgricultureContent> findByIsPublishedTrue();
    List<VerifiedAgricultureContent> findByCropIdAndIsPublishedTrue(Long cropId);
    List<VerifiedAgricultureContent> findByCropIdAndLanguageAndIsPublishedTrue(Long cropId, PreferredLanguage language);
    List<VerifiedAgricultureContent> findByCropIdAndCategoryIgnoreCaseAndIsPublishedTrue(Long cropId, String category);

    @Query("SELECT v FROM VerifiedAgricultureContent v WHERE v.isPublished = true AND (LOWER(v.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.contentBody) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<VerifiedAgricultureContent> searchPublishedContentByKeyword(@Param("keyword") String keyword);
}
