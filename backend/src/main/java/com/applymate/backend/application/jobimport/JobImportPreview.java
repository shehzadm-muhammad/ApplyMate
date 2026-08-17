package com.applymate.backend.application.jobimport;

import java.time.LocalDate;
import java.util.List;

public record JobImportPreview(
        String jobUrl,
        String company,
        String jobTitle,
        String location,
        String salary,
        String jobDescription,
        String requiredSkills,
        String benefits,
        String recruiter,
        LocalDate applicationDeadline,
        List<String> warnings
) {

    public JobImportPreview {
        jobUrl = blankIfNull(jobUrl);
        company = blankIfNull(company);
        jobTitle = blankIfNull(jobTitle);
        location = blankIfNull(location);
        salary = blankIfNull(salary);
        jobDescription = blankIfNull(jobDescription);
        requiredSkills = blankIfNull(requiredSkills);
        benefits = blankIfNull(benefits);
        recruiter = blankIfNull(recruiter);

        warnings = warnings == null
                ? List.of()
                : List.copyOf(warnings);
    }

    private static String blankIfNull(String value) {
        return value == null ? "" : value;
    }
}