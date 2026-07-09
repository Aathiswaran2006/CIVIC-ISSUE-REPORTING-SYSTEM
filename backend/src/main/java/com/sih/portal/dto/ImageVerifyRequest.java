package com.sih.portal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ImageVerifyRequest {
    @NotBlank(message = "Base64 image data is required")
    private String base64Image;
}
