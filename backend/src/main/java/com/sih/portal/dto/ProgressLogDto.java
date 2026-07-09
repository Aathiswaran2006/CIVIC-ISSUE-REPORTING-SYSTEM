package com.sih.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressLogDto {
    private String id;
    private String date;
    private String time;
    private String officerName;
    private String message;
}
