package com.sih.portal.controller;

import com.sih.portal.dto.AuditLogDto;
import com.sih.portal.security.UserPrincipal;
import com.sih.portal.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Endpoints for viewing secure activity logs (Admin only)")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get all platform audit logs chronologically (Admin only)")
    public ResponseEntity<List<AuditLogDto>> getAllAuditLogs(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AuditLogDto> list = auditLogService.getAllAuditLogs(principal.getUser());
        return ResponseEntity.ok(list);
    }
}
