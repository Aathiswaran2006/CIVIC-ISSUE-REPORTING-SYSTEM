package com.sih.portal.repository;

import com.sih.portal.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdInOrUserIdOrderByTimestampDesc(List<String> targetUserIds, String userId);
    List<Notification> findByUserIdOrderByTimestampDesc(String userId);
}
