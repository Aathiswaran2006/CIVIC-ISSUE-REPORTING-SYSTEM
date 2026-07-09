package com.sih.portal.mapper;

import com.sih.portal.dto.*;
import com.sih.portal.entity.*;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PortalMapper {

    public UserDto toUserDto(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .department(user.getDepartment())
                .district(user.getDistrict())
                .state(user.getState())
                .avatar(user.getAvatar())
                .build();
    }

    public TimelineEventDto toTimelineEventDto(ComplaintTimelineEvent event) {
        if (event == null) return null;
        return TimelineEventDto.builder()
                .id(event.getId())
                .status(event.getStatus())
                .updatedBy(event.getUpdatedBy())
                .remarks(event.getRemarks())
                .timestamp(event.getTimestamp())
                .build();
    }

    public ProgressLogDto toProgressLogDto(ComplaintProgress progress) {
        if (progress == null) return null;
        return ProgressLogDto.builder()
                .id(progress.getId())
                .date(progress.getDate())
                .time(progress.getTime())
                .officerName(progress.getOfficerName())
                .message(progress.getMessage())
                .build();
    }

    public ComplaintResponse toComplaintResponse(Complaint complaint) {
        if (complaint == null) return null;
        
        LocationDto locationDto = null;
        if (complaint.getLatitude() != null && complaint.getLongitude() != null) {
            locationDto = new LocationDto(complaint.getLatitude(), complaint.getLongitude());
        }

        List<TimelineEventDto> timelineDtos = Collections.emptyList();
        if (complaint.getTimeline() != null) {
            timelineDtos = complaint.getTimeline().stream()
                    .map(this::toTimelineEventDto)
                    .collect(Collectors.toList());
        }

        List<ProgressLogDto> progressDtos = Collections.emptyList();
        if (complaint.getProgressLogs() != null) {
            progressDtos = complaint.getProgressLogs().stream()
                    .map(this::toProgressLogDto)
                    .collect(Collectors.toList());
        }

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .images(complaint.getImages())
                .video(complaint.getVideo())
                .location(locationDto)
                .address(complaint.getAddress())
                .landmark(complaint.getLandmark())
                .state(complaint.getState())
                .district(complaint.getDistrict())
                .pinCode(complaint.getPinCode())
                .anonymous(complaint.isAnonymous())
                .citizenId(complaint.getCitizenId())
                .citizenName(complaint.isAnonymous() ? "" : complaint.getCitizenName())
                .submissionTime(complaint.getSubmissionTime())
                .assignedDepartment(complaint.getAssignedDepartment())
                .authorityRemarks(complaint.getAuthorityRemarks())
                .resolutionImage(complaint.getResolutionImage())
                .timeline(timelineDtos)
                .seenByAuthority(complaint.isSeenByAuthority())
                .seenTime(complaint.getSeenTime())
                .estimatedResolutionTime(complaint.getEstimatedResolutionTime())
                .isArchived(complaint.isArchived())
                .completionDate(complaint.getCompletionDate())
                .progressLogs(progressDtos)
                .build();
    }

    public NotificationDto toNotificationDto(Notification notification) {
        if (notification == null) return null;
        return NotificationDto.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .timestamp(notification.getTimestamp())
                .build();
    }

    public AuditLogDto toAuditLogDto(AuditLog auditLog) {
        if (auditLog == null) return null;
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .userId(auditLog.getUserId())
                .userName(auditLog.getUserName())
                .details(auditLog.getDetails())
                .timestamp(auditLog.getTimestamp())
                .build();
    }
}
