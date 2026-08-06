package com.smartkrishisahayak.repository;

import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerifiedAgricultureContentRepository extends JpaRepository<VerifiedAgricultureContent, Long> {
    List<VerifiedAgricultureContent> findByCropId(Long cropId);
    List<VerifiedAgricultureContent> findByIsPublishedTrue();
}
