package com.sih.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private String id;
    private String action;
    private String userId;
    private String userName;
    private String details;
    private String timestamp;
}
