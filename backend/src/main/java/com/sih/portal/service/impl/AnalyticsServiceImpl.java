package com.sih.portal.service.impl;

import com.sih.portal.dto.AnalyticsResponse;
import com.sih.portal.entity.AuditLog;
import com.sih.portal.entity.Complaint;
import com.sih.portal.entity.ComplaintStatus;
import com.sih.portal.repository.AuditLogRepository;
import com.sih.portal.repository.ComplaintRepository;
import com.sih.portal.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ComplaintRepository complaintRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {
        List<Complaint> complaints = complaintRepository.findAll();
        List<AuditLog> auditLogs = auditLogRepository.findAllByOrderByTimestampDesc();

        // 1. Calculate unique logged in users from audit logs
        long totalUsers = auditLogs.stream()
                .filter(log -> "USER_LOGIN".equals(log.getAction()))
                .map(AuditLog::getUserId)
                .distinct()
                .count();

        // If no user logins are recorded, fall back to counting total users as registered citizens (e.g. at least 1)
        if (totalUsers == 0) {
            totalUsers = 1; // Default mock fallback for safe UI rendering
        }

        long total = complaints.size();
        long pending = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.SUBMITTED || c.getStatus() == ComplaintStatus.UNDER_REVIEW)
                .count();
        long assigned = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED)
                .count();
        long inProgress = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS)
                .count();
        long resolved = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED)
                .count();
        long closed = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.CLOSED)
                .count();
        long rejected = complaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.REJECTED)
                .count();
        long active = inProgress + assigned;

        int resolutionRate = total > 0 ? (int) Math.round(((double) (resolved + closed) / total) * 100) : 0;

        // Group by Category
        Map<String, Long> categoryMap = complaints.stream()
                .collect(Collectors.groupingBy(Complaint::getCategory, Collectors.counting()));
        List<AnalyticsResponse.CategoryStat> byCategory = categoryMap.entrySet().stream()
                .map(entry -> new AnalyticsResponse.CategoryStat(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // Group by District
        Map<String, Long> districtMap = complaints.stream()
                .collect(Collectors.groupingBy(Complaint::getDistrict, Collectors.counting()));
        List<AnalyticsResponse.DistrictStat> byDistrict = districtMap.entrySet().stream()
                .map(entry -> new AnalyticsResponse.DistrictStat(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // Group by Monthly Trends (Last 6 Months)
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        int currentMonthIdx = LocalDateTime.now().getMonthValue() - 1; // 0-indexed

        List<String> last6Months = new ArrayList<>();
        Map<String, Long> countMap = new HashMap<>();
        Map<String, Long> resolvedMap = new HashMap<>();

        for (int i = 5; i >= 0; i--) {
            int mIdx = currentMonthIdx - i;
            if (mIdx < 0) {
                mIdx += 12;
            }
            String monthName = months[mIdx];
            last6Months.add(monthName);
            countMap.put(monthName, 0L);
            resolvedMap.put(monthName, 0L);
        }

        // Populate actual monthly trends
        for (Complaint c : complaints) {
            try {
                // Parse date, e.g. "2026-07-04T12:55:47.193Z" or similar ISO
                LocalDateTime date = LocalDateTime.parse(c.getSubmissionTime(), DateTimeFormatter.ISO_DATE_TIME);
                String monthName = months[date.getMonthValue() - 1];
                if (countMap.containsKey(monthName)) {
                    countMap.put(monthName, countMap.get(monthName) + 1);
                    if (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.CLOSED) {
                        resolvedMap.put(monthName, resolvedMap.get(monthName) + 1);
                    }
                }
            } catch (Exception e) {
                // Suppress date parse errors and keep count intact
            }
        }

        List<AnalyticsResponse.MonthlyTrend> monthlyTrends = last6Months.stream()
                .map(name -> new AnalyticsResponse.MonthlyTrend(name, countMap.get(name), resolvedMap.get(name)))
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .total(total)
                .pending(pending)
                .assigned(assigned)
                .inProgress(inProgress)
                .resolved(resolved)
                .closed(closed)
                .active(active)
                .rejected(rejected)
                .resolutionRate(resolutionRate)
                .byCategory(byCategory)
                .byDistrict(byDistrict)
                .monthlyTrends(monthlyTrends)
                .build();
    }
}
