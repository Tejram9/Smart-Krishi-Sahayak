package com.smartkrishisahayak.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "verified_agriculture_content")
public class VerifiedAgricultureContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id")
    @JsonIgnore
    private Crop crop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_admin_id", nullable = false)
    @JsonIgnore
    private User authorAdmin;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content_body", nullable = false, columnDefinition = "MEDIUMTEXT")
    private String contentBody;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "language", nullable = false, length = 10)
    private PreferredLanguage language = PreferredLanguage.MR;

    @Column(name = "is_published", nullable = false)
    private boolean isPublished = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public VerifiedAgricultureContent() {
    }

    public VerifiedAgricultureContent(Crop crop, User authorAdmin, String title, String contentBody, String category, PreferredLanguage language, boolean isPublished) {
        this.crop = crop;
        this.authorAdmin = authorAdmin;
        this.title = title;
        this.contentBody = contentBody;
        this.category = category;
        this.language = language;
        this.isPublished = isPublished;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Crop getCrop() {
        return crop;
    }

    public void setCrop(Crop crop) {
        this.crop = crop;
    }

    public User getAuthorAdmin() {
        return authorAdmin;
    }

    public void setAuthorAdmin(User authorAdmin) {
        this.authorAdmin = authorAdmin;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentBody() {
        return contentBody;
    }

    public void setContentBody(String contentBody) {
        this.contentBody = contentBody;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public PreferredLanguage getLanguage() {
        return language;
    }

    public void setLanguage(PreferredLanguage language) {
        this.language = language;
    }

    public boolean isPublished() {
        return isPublished;
    }

    public void setPublished(boolean published) {
        isPublished = published;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
