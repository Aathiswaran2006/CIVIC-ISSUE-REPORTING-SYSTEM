package com.sih.portal.dto;

import com.sih.portal.entity.ComplaintPriority;
import lombok.Data;

@Data
public class AssignmentRequest {
    private String assignedDepartment;
    private ComplaintPriority priority;
}
