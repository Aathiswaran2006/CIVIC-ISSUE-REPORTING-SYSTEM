package com.sih.portal.dto;

import com.sih.portal.entity.ComplaintPriority;
import com.sih.portal.entity.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    private String id;
    private String title;
    private String description;
    private String category;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private List<String> images;
    private String video;
    private LocationDto location;
    private String address;
    private String landmark;
    private String state;
    private String district;
    private String pinCode;
    private boolean anonymous;
    private String citizenId;
    private String citizenName;
    private String submissionTime;
    private String assignedDepartment;
    private String authorityRemarks;
    private String resolutionImage;
    private List<TimelineEventDto> timeline;

    private boolean seenByAuthority;
    private String seenTime;
    private String estimatedResolutionTime;
    private boolean isArchived;
    private String completionDate;
    private List<ProgressLogDto> progressLogs;
}
