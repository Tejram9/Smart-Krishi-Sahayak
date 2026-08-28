package com.smartkrishisahayak.repository;

import com.smartkrishisahayak.entity.DiseaseDetection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiseaseDetectionRepository extends JpaRepository<DiseaseDetection, Long> {

    List<DiseaseDetection> findByUserIdOrderByDetectedAtDesc(Long userId);

    Optional<DiseaseDetection> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    List<DiseaseDetection> findAllByOrderByDetectedAtDesc();
}
