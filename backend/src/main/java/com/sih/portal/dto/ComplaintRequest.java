package com.sih.portal.dto;

import com.sih.portal.entity.ComplaintPriority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ComplaintRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private ComplaintPriority priority;

    private List<String> images;

    private String video;

    @NotNull(message = "Location is required")
    @Valid
    private LocationDto location;

    @NotBlank(message = "Address is required")
    private String address;

    private String landmark;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Pin Code is required")
    private String pinCode;

    private boolean anonymous;
}
