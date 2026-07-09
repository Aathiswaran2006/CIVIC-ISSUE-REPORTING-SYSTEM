package com.sih.portal.service;

import com.sih.portal.dto.AuditLogDto;
import com.sih.portal.entity.User;
import java.util.List;

public interface AuditLogService {
    void log(String action, String userId, String userName, String details);
    List<AuditLogDto> getAllAuditLogs(User currentUser);
}
