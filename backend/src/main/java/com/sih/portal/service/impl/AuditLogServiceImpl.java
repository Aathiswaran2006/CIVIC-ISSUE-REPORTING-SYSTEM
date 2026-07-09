package com.sih.portal.service.impl;

import com.sih.portal.dto.AuditLogDto;
import com.sih.portal.entity.AuditLog;
import com.sih.portal.entity.User;
import com.sih.portal.entity.UserRole;
import com.sih.portal.exception.UnauthorizedException;
import com.sih.portal.mapper.PortalMapper;
import com.sih.portal.repository.AuditLogRepository;
import com.sih.portal.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final PortalMapper portalMapper;

    @Override
    @Transactional
    public void log(String action, String userId, String userName, String details) {
        AuditLog log = AuditLog.builder()
                .id("log-" + System.currentTimeMillis())
                .action(action)
                .userId(userId)
                .userName(userName)
                .details(details)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllAuditLogs(User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Access denied. Admin only.");
        }
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(portalMapper::toAuditLogDto)
                .collect(Collectors.toList());
    }
}
