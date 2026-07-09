package com.sih.portal.service.impl;

import com.sih.portal.dto.NotificationDto;
import com.sih.portal.entity.Notification;
import com.sih.portal.entity.User;
import com.sih.portal.entity.UserRole;
import com.sih.portal.mapper.PortalMapper;
import com.sih.portal.repository.NotificationRepository;
import com.sih.portal.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final PortalMapper portalMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(User currentUser) {
        List<String> targets = new ArrayList<>();
        targets.add("all");
        targets.add(currentUser.getId());
        
        if (currentUser.getRole() == UserRole.ADMIN) {
            targets.add("admin");
        }

        List<Notification> notifications = notificationRepository.findByUserIdInOrUserIdOrderByTimestampDesc(targets, currentUser.getId());
        return notifications.stream()
                .map(portalMapper::toNotificationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAllNotificationsAsRead(User currentUser) {
        List<String> targets = new ArrayList<>();
        targets.add("all");
        targets.add(currentUser.getId());
        
        if (currentUser.getRole() == UserRole.ADMIN) {
            targets.add("admin");
        }

        List<Notification> notifications = notificationRepository.findByUserIdInOrUserIdOrderByTimestampDesc(targets, currentUser.getId());
        for (Notification n : notifications) {
            n.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void createNotification(String userId, String title, String message) {
        Notification notification = Notification.builder()
                .id("n-" + System.currentTimeMillis())
                .userId(userId)
                .title(title)
                .message(message)
                .read(false)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();
        notificationRepository.save(notification);
    }
}
