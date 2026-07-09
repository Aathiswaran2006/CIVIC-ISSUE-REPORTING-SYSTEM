package com.sih.portal.service;

import com.sih.portal.dto.NotificationDto;
import com.sih.portal.entity.User;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getUserNotifications(User currentUser);
    void markAllNotificationsAsRead(User currentUser);
    void createNotification(String userId, String title, String message);
}
