package com.sih.portal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "archive_complaint")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchiveComplaint {

    @Id
    private String id;

    @Column(nullable = false, columnDefinition = "TEXT", name = "complaint_json")
    private String complaintJson;

    @Column(name = "completion_date")
    private String completionDate;

    @Column(name = "authority_name")
    private String authorityName;

    @Column(name = "citizen_name")
    private String citizenName;

    @Column(name = "pin_code")
    private String pinCode;
}
