package com.sih.portal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AIAnalyzeRequest {
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private LocationDto location;
}
