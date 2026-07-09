package com.sih.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIAnalyzeResponse {
    private String suggestedCategory;
    private String predictedPriority;
    private String executiveSummary;
    private boolean isDuplicate;
    private String duplicateOfId;
}
