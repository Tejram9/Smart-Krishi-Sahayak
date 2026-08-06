package com.smartkrishisahayak.repository;

import com.smartkrishisahayak.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    
    List<Crop> findByCategory(String category);

    @Query("SELECT c FROM Crop c WHERE LOWER(c.nameEn) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.nameMr) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.nameHi) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Crop> searchCropsByKeyword(@Param("query") String query);
}
