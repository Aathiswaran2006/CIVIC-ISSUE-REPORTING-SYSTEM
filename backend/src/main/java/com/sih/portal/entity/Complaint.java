package com.sih.portal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_images", joinColumns = @JoinColumn(name = "complaint_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String video;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    private String landmark;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false, name = "pin_code")
    private String pinCode;

    private boolean anonymous;

    @Column(nullable = false)
    private String citizenId;

    private String citizenName;

    @Column(nullable = false)
    private String submissionTime;

    private String assignedDepartment;

    @Column(columnDefinition = "TEXT")
    private String authorityRemarks;

    @Column(columnDefinition = "TEXT")
    private String resolutionImage;

    @Builder.Default
    private boolean seenByAuthority = false;

    private String seenTime;

    private String estimatedResolutionTime;

    @Builder.Default
    private boolean isArchived = false;

    private String completionDate;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("id ASC")
    @Builder.Default
    private List<ComplaintProgress> progressLogs = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("timestamp ASC")
    @Builder.Default
    private List<ComplaintTimelineEvent> timeline = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.submissionTime == null) {
            this.submissionTime = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
        }
    }
}
