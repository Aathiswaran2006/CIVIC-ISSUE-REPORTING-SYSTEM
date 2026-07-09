package com.sih.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {
    private long totalUsers;
    private long total;
    private long pending;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long closed;
    private long active; // inProgress + assigned
    private long rejected;
    private int resolutionRate; // percentage
    private List<CategoryStat> byCategory;
    private List<DistrictStat> byDistrict;
    private List<MonthlyTrend> monthlyTrends;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryStat {
        private String name;
        private long value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DistrictStat {
        private String name;
        private long value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyTrend {
        private String name; // e.g. "Jan", "Feb"
        private long count;
        private long resolved;
    }
}
