package com.sih.portal.dto;

import com.sih.portal.entity.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEventDto {
    private String id;
    private ComplaintStatus status;
    private String updatedBy;
    private String remarks;
    private String timestamp;
}
