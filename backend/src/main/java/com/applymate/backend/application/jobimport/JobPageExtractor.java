package com.applymate.backend.application.jobimport;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.applymate.backend.application.jobimport.JobImportException.Reason.EXTRACTION_FAILED;

@Component
public class JobPageExtractor {

    private static final int URL_MAX = 2000;
    private static final int SHORT_MAX = 200;
    private static final int DESCRIPTION_MAX = 20_000;
    private static final int LONG_MAX = 10_000;

    private static final int STRUCTURED_DESCRIPTION_THRESHOLD = 80;
    private static final int HTML_DESCRIPTION_THRESHOLD = 160;
    private static final int HTML_SIGNAL_THRESHOLD = 2;

    private static final Pattern ISO_DATE =
            Pattern.compile("(?<!\\d)(\\d{4}-\\d{2}-\\d{2})(?!\\d)");

    private static final Pattern TEXT_DATE =
            Pattern.compile(
                    "(?i)\\b(\\d{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{4})\\b"
            );

    private static final Pattern SLASH_DATE =
            Pattern.compile("\\b(\\d{1,2}/\\d{1,2}/\\d{4})\\b");

    private final JsonMapper jsonMapper;

    public JobPageExtractor() {
        this(JsonMapper.builder().build());
    }

    JobPageExtractor(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    JobImportPreview extract(
            SafeJobPageFetcher.FetchedPage page
    ) {
        Document document = Jsoup.parse(
                page.html(),
                page.finalUri().toString()
        );

        Candidate structured =
                extractStructured(document);

        Candidate html =
                extractHtml(
                        page.html(),
                        page.finalUri().toString()
                );

        Candidate selected;

        if (structuredSuccess(structured)) {
            selected = merge(
                    structured,
                    html
            );
        } else if (htmlSuccess(html)) {
            selected = html;
        } else {
            throw new JobImportException(
                    EXTRACTION_FAILED
            );
        }

        return toPreview(
                page,
                selected
        );
    }

    private Candidate extractStructured(
            Document document
    ) {
        List<JsonNode> postings =
                new ArrayList<>();

        for (Element script :
                document.select(
                        "script[type=application/ld+json]"
                )) {

            String json = script.data();

            if (json == null || json.isBlank()) {
                json = script.html();
            }

            try {
                JsonNode root =
                        jsonMapper.readTree(json);

                collectJobPostings(
                        root,
                        postings
                );
            } catch (Exception ignored) {
                /*
                 * One malformed JSON-LD block must not prevent
                 * another valid block or the HTML fallback
                 * from being used.
                 */
            }
        }

        Candidate best =
                new Candidate();

        int bestScore = -1;

        for (JsonNode posting : postings) {
            Candidate candidate =
                    candidateFromPosting(posting);

            int score =
                    candidateScore(candidate);

            if (score > bestScore) {
                best = candidate;
                bestScore = score;
            }
        }

        return best;
    }

    private void collectJobPostings(
            JsonNode node,
            List<JsonNode> postings
    ) {
        if (node == null
                || node.isNull()
                || node.isMissingNode()) {
            return;
        }

        if (node.isObject()
                && isJobPosting(node)) {
            postings.add(node);
        }

        if (node.isObject()
                || node.isArray()) {

            for (JsonNode child : node) {
                collectJobPostings(
                        child,
                        postings
                );
            }
        }
    }

    private boolean isJobPosting(
            JsonNode node
    ) {
        JsonNode type =
                node.get("@type");

        if (type == null) {
            return false;
        }

        if (type.isString()) {
            return "JobPosting".equalsIgnoreCase(
                    type.asString("")
            );
        }

        if (type.isArray()) {
            for (JsonNode item : type) {
                if (item.isString()
                        && "JobPosting".equalsIgnoreCase(
                        item.asString("")
                )) {
                    return true;
                }
            }
        }

        return false;
    }

    private Candidate candidateFromPosting(
            JsonNode posting
    ) {
        Candidate candidate =
                new Candidate();

        candidate.title =
                text(posting.get("title"));

        JsonNode organisation =
                posting.get("hiringOrganization");

        candidate.company =
                objectValue(
                        organisation,
                        "name"
                );

        candidate.location =
                extractLocation(posting);

        candidate.salary =
                extractSalary(posting);

        candidate.description =
                text(posting.get("description"));

        candidate.skills =
                joinDistinct(
                        text(posting.get("skills")),
                        text(posting.get("qualifications")),
                        text(posting.get(
                                "experienceRequirements"
                        ))
                );

        candidate.benefits =
                firstNonBlank(
                        text(posting.get("jobBenefits")),
                        text(posting.get("benefits"))
                );

        candidate.recruiter =
                firstNonBlank(
                        contactText(
                                posting.get("contactPoint")
                        ),
                        contactText(
                                organisation == null
                                        ? null
                                        : organisation.get(
                                        "contactPoint"
                                )
                        )
                );

        candidate.deadline =
                parseDate(
                        text(posting.get("validThrough"))
                );

        return candidate;
    }

    private String extractLocation(
            JsonNode posting
    ) {
        String jobLocation =
                locationText(
                        posting.get("jobLocation")
                );

        if (!jobLocation.isBlank()) {
            return jobLocation;
        }

        return locationText(
                posting.get(
                        "applicantLocationRequirements"
                )
        );
    }

    private String locationText(
            JsonNode node
    ) {
        if (node == null
                || node.isNull()) {
            return "";
        }

        if (node.isArray()) {
            List<String> locations =
                    new ArrayList<>();

            for (JsonNode item : node) {
                String value =
                        locationText(item);

                if (!value.isBlank()) {
                    locations.add(value);
                }
            }

            return String.join(
                    " | ",
                    locations
            );
        }

        if (!node.isObject()) {
            return text(node);
        }

        JsonNode address =
                node.get("address");

        if (address != null) {
            if (address.isObject()) {
                String value =
                        joinDistinct(
                                text(address.get(
                                        "addressLocality"
                                )),
                                text(address.get(
                                        "addressRegion"
                                )),
                                objectOrText(
                                        address.get(
                                                "addressCountry"
                                        )
                                )
                        );

                if (!value.isBlank()) {
                    return value;
                }
            } else {
                String value =
                        text(address);

                if (!value.isBlank()) {
                    return value;
                }
            }
        }

        return objectValue(
                node,
                "name"
        );
    }

    private String extractSalary(
            JsonNode posting
    ) {
        JsonNode salary =
                posting.get("baseSalary");

        if (salary == null
                || salary.isNull()) {
            return "";
        }

        if (!salary.isObject()) {
            return text(salary);
        }

        String currency =
                text(salary.get("currency"));

        JsonNode valueNode =
                salary.get("value");

        String amount = "";
        String unit = "";

        if (valueNode != null
                && valueNode.isObject()) {

            String minimum =
                    text(valueNode.get("minValue"));

            String maximum =
                    text(valueNode.get("maxValue"));

            String exact =
                    text(valueNode.get("value"));

            unit =
                    text(valueNode.get("unitText"));

            if (!minimum.isBlank()
                    && !maximum.isBlank()) {
                amount =
                        minimum + " - " + maximum;
            } else {
                amount =
                        firstNonBlank(
                                exact,
                                minimum,
                                maximum
                        );
            }

        } else {
            amount =
                    text(valueNode);
        }

        return joinWithSpace(
                currency,
                amount,
                unit
        );
    }

    private String contactText(
            JsonNode node
    ) {
        if (node == null
                || node.isNull()) {
            return "";
        }

        if (node.isArray()) {
            List<String> contacts =
                    new ArrayList<>();

            for (JsonNode item : node) {
                String value =
                        contactText(item);

                if (!value.isBlank()) {
                    contacts.add(value);
                }
            }

            return String.join(
                    " | ",
                    contacts
            );
        }

        if (!node.isObject()) {
            return text(node);
        }

        return joinDistinct(
                text(node.get("name")),
                text(node.get("email")),
                text(node.get("telephone"))
        );
    }

    private String objectOrText(
            JsonNode node
    ) {
        if (node == null
                || node.isNull()) {
            return "";
        }

        if (node.isObject()) {
            return firstNonBlank(
                    objectValue(node, "name"),
                    objectValue(node, "value")
            );
        }

        return text(node);
    }

    private String objectValue(
            JsonNode node,
            String property
    ) {
        if (node == null
                || !node.isObject()) {
            return "";
        }

        return text(
                node.get(property)
        );
    }

    private String text(
            JsonNode node
    ) {
        if (node == null
                || node.isNull()
                || node.isMissingNode()) {
            return "";
        }

        if (node.isArray()) {
            List<String> values =
                    new ArrayList<>();

            for (JsonNode item : node) {
                String value = text(item);

                if (!value.isBlank()) {
                    values.add(value);
                }
            }

            return joinDistinct(
                    values.toArray(String[]::new)
            );
        }

        if (node.isObject()) {
            return firstNonBlank(
                    objectValue(node, "name"),
                    objectValue(node, "description"),
                    objectValue(node, "value")
            );
        }

        return plain(
                node.asString("")
        );
    }

    private Candidate extractHtml(
            String html,
            String baseUri
    ) {
        Document document =
                Jsoup.parse(
                        html,
                        baseUri
                );

        document.select(
                "script, style, noscript, nav, footer, "
                        + "header, aside, form, svg, canvas, "
                        + "[class*=cookie], [id*=cookie]"
        ).remove();

        Candidate candidate =
                new Candidate();

        candidate.title =
                firstNonBlank(
                        elementText(
                                document.selectFirst("h1")
                        ),
                        meta(
                                document,
                                "meta[property=og:title]"
                        ),
                        meta(
                                document,
                                "meta[name=twitter:title]"
                        ),
                        plain(document.title())
                );

        candidate.company =
                firstNonBlank(
                        meta(
                                document,
                                "meta[property=og:site_name]"
                        ),
                        shortSelectedText(
                                document,
                                "[class*=company], "
                                        + "[class*=employer], "
                                        + "[data-testid*=company]",
                                SHORT_MAX
                        ),
                        labelledValue(
                                document,
                                "company",
                                "employer"
                        )
                );

        candidate.location =
                firstNonBlank(
                        shortSelectedText(
                                document,
                                "[class*=location], "
                                        + "[data-testid*=location]",
                                SHORT_MAX
                        ),
                        labelledValue(
                                document,
                                "location",
                                "job location"
                        )
                );

        candidate.salary =
                firstNonBlank(
                        shortSelectedText(
                                document,
                                "[class*=salary], "
                                        + "[class*=compensation], "
                                        + "[data-testid*=salary]",
                                SHORT_MAX
                        ),
                        labelledValue(
                                document,
                                "salary",
                                "pay",
                                "compensation"
                        )
                );

        candidate.skills =
                sectionText(
                        document,
                        "requirements",
                        "requirement",
                        "qualifications",
                        "qualification",
                        "skills",
                        "what you'll need",
                        "what you will need"
                );

        candidate.benefits =
                sectionText(
                        document,
                        "benefits",
                        "benefit",
                        "perks",
                        "what we offer",
                        "rewards"
                );

        candidate.recruiter =
                labelledValue(
                        document,
                        "recruiter",
                        "contact",
                        "hiring manager"
                );

        candidate.deadline =
                parseDate(
                        labelledValue(
                                document,
                                "closing date",
                                "application deadline",
                                "deadline"
                        )
                );

        candidate.description =
                mainText(document);

        candidate.htmlSignals =
                countJobSignals(document);

        return candidate;
    }

    private String mainText(
            Document document
    ) {
        Element content =
                document.selectFirst("main");

        if (content == null) {
            content =
                    document.selectFirst("article");
        }

        if (content == null) {
            content = document.body();
        }

        return elementText(content);
    }

    private String meta(
            Document document,
            String selector
    ) {
        Element element =
                document.selectFirst(selector);

        if (element == null) {
            return "";
        }

        return plain(
                element.attr("content")
        );
    }

    private String shortSelectedText(
            Document document,
            String selector,
            int maxLength
    ) {
        for (Element element :
                document.select(selector)) {

            String value =
                    elementText(element);

            if (!value.isBlank()
                    && value.length() <= maxLength) {
                return value;
            }
        }

        return "";
    }

    private String labelledValue(
            Document document,
            String... labels
    ) {
        for (Element element :
                document.select(
                        "dt, strong, b"
                )) {

            String label =
                    elementText(element)
                            .toLowerCase(Locale.ROOT);

            if (!containsAny(
                    label,
                    labels
            )) {
                continue;
            }

            Element sibling =
                    element.nextElementSibling();

            if (sibling != null) {
                String siblingValue =
                        elementText(sibling);

                if (!siblingValue.isBlank()
                        && siblingValue.length() <= 500) {
                    return siblingValue;
                }
            }

            Element parent =
                    element.parent();

            if (parent != null) {
                String parentText =
                        elementText(parent);

                String labelText =
                        elementText(element);

                if (parentText
                        .toLowerCase(Locale.ROOT)
                        .startsWith(
                                labelText
                                        .toLowerCase(Locale.ROOT)
                        )) {

                    String remainder =
                            parentText.substring(
                                    Math.min(
                                            labelText.length(),
                                            parentText.length()
                                    )
                            )
                                    .replaceFirst(
                                            "^[\\s:\\-–—]+",
                                            ""
                                    )
                                    .trim();

                    if (!remainder.isBlank()
                            && remainder.length() <= 500) {
                        return remainder;
                    }
                }
            }
        }

        return "";
    }

    private String sectionText(
            Document document,
            String... headings
    ) {
        for (Element heading :
                document.select(
                        "h2, h3, h4, h5, strong"
                )) {

            String headingText =
                    elementText(heading)
                            .toLowerCase(Locale.ROOT);

            if (!containsAny(
                    headingText,
                    headings
            )) {
                continue;
            }

            StringBuilder value =
                    new StringBuilder();

            Element sibling =
                    heading.nextElementSibling();

            while (sibling != null
                    && !isHeading(sibling)) {

                String text =
                        elementText(sibling);

                if (!text.isBlank()) {
                    if (!value.isEmpty()) {
                        value.append(' ');
                    }

                    value.append(text);
                }

                if (value.length() >= LONG_MAX) {
                    break;
                }

                sibling =
                        sibling.nextElementSibling();
            }

            String extracted =
                    plain(value.toString());

            if (!extracted.isBlank()) {
                return extracted;
            }
        }

        return "";
    }

    private boolean isHeading(
            Element element
    ) {
        return switch (
                element.tagName()
                        .toLowerCase(Locale.ROOT)
                ) {
            case "h1", "h2", "h3", "h4", "h5", "h6" ->
                    true;
            default ->
                    false;
        };
    }

    private int countJobSignals(
            Document document
    ) {
        String headings =
                document.select(
                        "h2, h3, h4, h5, strong, b"
                )
                        .text()
                        .toLowerCase(Locale.ROOT);

        int signals = 0;

        if (containsAny(
                headings,
                "requirement",
                "qualification",
                "skills",
                "experience"
        )) {
            signals++;
        }

        if (containsAny(
                headings,
                "responsibilities",
                "responsibility",
                "duties",
                "what you'll do",
                "what you will do",
                "the role",
                "about the role",
                "job description"
        )) {
            signals++;
        }

        if (containsAny(
                headings,
                "benefits",
                "perks",
                "what we offer",
                "rewards"
        )) {
            signals++;
        }

        if (containsAny(
                headings,
                "salary",
                "pay",
                "compensation"
        )) {
            signals++;
        }

        if (containsAny(
                headings,
                "closing date",
                "deadline",
                "application process",
                "how to apply"
        )) {
            signals++;
        }

        return signals;
    }

    private boolean structuredSuccess(
            Candidate candidate
    ) {
        return !plain(candidate.title).isBlank()
                && (
                !plain(candidate.company).isBlank()
                        || !plain(
                        candidate.location
                ).isBlank()
                        || plain(
                        candidate.description
                ).length()
                        >= STRUCTURED_DESCRIPTION_THRESHOLD
        );
    }

    private boolean htmlSuccess(
            Candidate candidate
    ) {
        return !plain(candidate.title).isBlank()
                && plain(
                candidate.description
        ).length()
                >= HTML_DESCRIPTION_THRESHOLD
                && candidate.htmlSignals
                >= HTML_SIGNAL_THRESHOLD;
    }

    private Candidate merge(
            Candidate primary,
            Candidate fallback
    ) {
        Candidate merged =
                new Candidate();

        merged.title =
                firstNonBlank(
                        primary.title,
                        fallback.title
                );

        merged.company =
                firstNonBlank(
                        primary.company,
                        fallback.company
                );

        merged.location =
                firstNonBlank(
                        primary.location,
                        fallback.location
                );

        merged.salary =
                firstNonBlank(
                        primary.salary,
                        fallback.salary
                );

        merged.description =
                firstNonBlank(
                        primary.description,
                        fallback.description
                );

        merged.skills =
                firstNonBlank(
                        primary.skills,
                        fallback.skills
                );

        merged.benefits =
                firstNonBlank(
                        primary.benefits,
                        fallback.benefits
                );

        merged.recruiter =
                firstNonBlank(
                        primary.recruiter,
                        fallback.recruiter
                );

        merged.deadline =
                primary.deadline != null
                        ? primary.deadline
                        : fallback.deadline;

        merged.htmlSignals =
                fallback.htmlSignals;

        return merged;
    }

    private JobImportPreview toPreview(
            SafeJobPageFetcher.FetchedPage page,
            Candidate candidate
    ) {
        Truncation truncation =
                new Truncation();

        String jobUrl =
                truncateRaw(
                        page.finalUri().toString(),
                        URL_MAX,
                        truncation
                );

        String company =
                fit(
                        candidate.company,
                        SHORT_MAX,
                        truncation
                );

        String title =
                fit(
                        candidate.title,
                        SHORT_MAX,
                        truncation
                );

        String location =
                fit(
                        candidate.location,
                        SHORT_MAX,
                        truncation
                );

        String salary =
                fit(
                        candidate.salary,
                        SHORT_MAX,
                        truncation
                );

        String description =
                fit(
                        candidate.description,
                        DESCRIPTION_MAX,
                        truncation
                );

        String skills =
                fit(
                        candidate.skills,
                        LONG_MAX,
                        truncation
                );

        String benefits =
                fit(
                        candidate.benefits,
                        LONG_MAX,
                        truncation
                );

        String recruiter =
                fit(
                        candidate.recruiter,
                        SHORT_MAX,
                        truncation
                );

        List<String> warnings =
                new ArrayList<>();

        if (truncation.occurred) {
            warnings.add(
                    "Some imported fields were shortened "
                            + "to fit ApplyMate limits."
            );
        }

        if (company.isBlank()
                || location.isBlank()
                || salary.isBlank()
                || description.isBlank()
                || skills.isBlank()
                || benefits.isBlank()
                || candidate.deadline == null) {

            warnings.add(
                    "Some job details could not be detected. "
                            + "Please review the imported information."
            );
        }

        return new JobImportPreview(
                jobUrl,
                company,
                title,
                location,
                salary,
                description,
                skills,
                benefits,
                recruiter,
                candidate.deadline,
                warnings
        );
    }

    private String fit(
            String value,
            int maxLength,
            Truncation truncation
    ) {
        return truncateRaw(
                plain(value),
                maxLength,
                truncation
        );
    }

    private String truncateRaw(
            String value,
            int maxLength,
            Truncation truncation
    ) {
        String cleaned =
                value == null
                        ? ""
                        : value.trim();

        if (cleaned.length()
                <= maxLength) {
            return cleaned;
        }

        truncation.occurred = true;

        int end = maxLength;

        if (end > 0
                && Character.isHighSurrogate(
                cleaned.charAt(end - 1)
        )) {
            end--;
        }

        return cleaned.substring(
                0,
                end
        );
    }

    private String plain(
            String value
    ) {
        if (value == null
                || value.isBlank()) {
            return "";
        }

        return Jsoup.parseBodyFragment(value)
                .text()
                .replace('\u00A0', ' ')
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String elementText(
            Element element
    ) {
        return element == null
                ? ""
                : plain(element.text());
    }

    private String joinDistinct(
            String... values
    ) {
        Set<String> unique =
                new LinkedHashSet<>();

        for (String value : values) {
            String cleaned =
                    plain(value);

            if (!cleaned.isBlank()) {
                unique.add(cleaned);
            }
        }

        return String.join(
                ", ",
                unique
        );
    }

    private String joinWithSpace(
            String... values
    ) {
        List<String> cleaned =
                new ArrayList<>();

        for (String value : values) {
            String item =
                    plain(value);

            if (!item.isBlank()) {
                cleaned.add(item);
            }
        }

        return String.join(
                " ",
                cleaned
        );
    }

    private boolean containsAny(
            String value,
            String... needles
    ) {
        String lower =
                value.toLowerCase(Locale.ROOT);

        for (String needle : needles) {
            if (lower.contains(
                    needle.toLowerCase(Locale.ROOT)
            )) {
                return true;
            }
        }

        return false;
    }

    private String firstNonBlank(
            String... values
    ) {
        for (String value : values) {
            String cleaned =
                    plain(value);

            if (!cleaned.isBlank()) {
                return cleaned;
            }
        }

        return "";
    }

    private LocalDate parseDate(
            String value
    ) {
        String cleaned =
                plain(value);

        if (cleaned.isBlank()) {
            return null;
        }

        Matcher iso =
                ISO_DATE.matcher(cleaned);

        if (iso.find()) {
            try {
                return LocalDate.parse(
                        iso.group(1)
                );
            } catch (DateTimeParseException ignored) {
                // Try the remaining supported formats.
            }
        }

        Matcher text =
                TEXT_DATE.matcher(cleaned);

        if (text.find()) {
            for (String pattern :
                    List.of(
                            "d MMMM uuuu",
                            "d MMM uuuu"
                    )) {

                try {
                    return LocalDate.parse(
                            text.group(1),
                            DateTimeFormatter
                                    .ofPattern(
                                            pattern,
                                            Locale.UK
                                    )
                    );
                } catch (DateTimeParseException ignored) {
                    // Try next format.
                }
            }
        }

        Matcher slash =
                SLASH_DATE.matcher(cleaned);

        if (slash.find()) {
            try {
                return LocalDate.parse(
                        slash.group(1),
                        DateTimeFormatter
                                .ofPattern(
                                        "d/M/uuuu",
                                        Locale.UK
                                )
                );
            } catch (DateTimeParseException ignored) {
                return null;
            }
        }

        return null;
    }

    private int candidateScore(
            Candidate candidate
    ) {
        int score = 0;

        if (!plain(candidate.title).isBlank()) {
            score += 4;
        }

        if (!plain(candidate.company).isBlank()) {
            score += 3;
        }

        if (!plain(candidate.description).isBlank()) {
            score += 3;
        }

        if (!plain(candidate.location).isBlank()) {
            score += 2;
        }

        if (!plain(candidate.salary).isBlank()) {
            score++;
        }

        if (!plain(candidate.skills).isBlank()) {
            score++;
        }

        if (!plain(candidate.benefits).isBlank()) {
            score++;
        }

        if (candidate.deadline != null) {
            score++;
        }

        return score;
    }

    private static final class Candidate {

        private String title = "";
        private String company = "";
        private String location = "";
        private String salary = "";
        private String description = "";
        private String skills = "";
        private String benefits = "";
        private String recruiter = "";
        private LocalDate deadline;
        private int htmlSignals;
    }

    private static final class Truncation {

        private boolean occurred;
    }
}