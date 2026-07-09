package com.sih.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageVerifyResponse {
    private boolean valid;
    private Double confidence;
    private String detectedIssue;
    private String description;
}
