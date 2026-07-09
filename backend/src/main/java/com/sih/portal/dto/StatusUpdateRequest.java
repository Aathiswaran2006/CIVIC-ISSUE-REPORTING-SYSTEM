package com.sih.portal.dto;

import com.sih.portal.entity.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    @NotBlank(message = "Remarks are required")
    private String remarks;

    private String resolutionImage;
}
