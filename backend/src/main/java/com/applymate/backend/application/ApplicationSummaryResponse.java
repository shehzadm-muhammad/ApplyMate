package com.applymate.backend.application;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

public record ApplicationSummaryResponse(
        long total,
        long saved,
        long applied,
        long assessment,
        long interview,
        long offer,
        long rejected
) {

    public static ApplicationSummaryResponse from(
            List<ApplicationStatusCount> rows
    ) {
        Map<ApplicationStatus, Long> counts =
                new EnumMap<>(ApplicationStatus.class);

        Arrays.stream(ApplicationStatus.values())
                .forEach(status -> counts.put(status, 0L));

        rows.forEach(row ->
                counts.put(row.getStatus(), row.getCount())
        );

        long total = counts.values()
                .stream()
                .mapToLong(Long::longValue)
                .sum();

        return new ApplicationSummaryResponse(
                total,
                counts.get(ApplicationStatus.SAVED),
                counts.get(ApplicationStatus.APPLIED),
                counts.get(ApplicationStatus.ASSESSMENT),
                counts.get(ApplicationStatus.INTERVIEW),
                counts.get(ApplicationStatus.OFFER),
                counts.get(ApplicationStatus.REJECTED)
        );
    }
}