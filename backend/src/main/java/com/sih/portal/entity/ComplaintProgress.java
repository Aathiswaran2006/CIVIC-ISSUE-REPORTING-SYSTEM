package com.sih.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "complaint_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintProgress {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    @JsonIgnore
    private Complaint complaint;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false, name = "officer_name")
    private String officerName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
}
