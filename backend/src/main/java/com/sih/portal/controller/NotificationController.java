package com.sih.portal.controller;

import com.sih.portal.dto.NotificationDto;
import com.sih.portal.security.UserPrincipal;
import com.sih.portal.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for user alerts, system updates, and broadcast markers")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all alerts/notifications matching current user's profile and roles")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(principal.getUser());
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications matching user role as read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllNotificationsAsRead(principal.getUser());
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }
}
