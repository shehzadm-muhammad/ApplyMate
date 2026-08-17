package com.applymate.backend.application.jobimport;

import org.junit.jupiter.api.Test;

import java.net.URI;
import java.time.LocalDate;

import static com.applymate.backend.application.jobimport.JobImportException.Reason.EXTRACTION_FAILED;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JobPageExtractorTest {

    private final JobPageExtractor extractor =
            new JobPageExtractor();

    @Test
    void extractsStructuredJobPostingAndStripsHtml() {
        String html = """
                <html>
                <head>
                  <script type="application/ld+json">
                  {
                    "@context": "https://schema.org",
                    "@type": "JobPosting",
                    "title": "Graduate Software Engineer",
                    "hiringOrganization": {
                      "@type": "Organization",
                      "name": "Example Ltd",
                      "contactPoint": {
                        "@type": "ContactPoint",
                        "name": "Jane Recruiter",
                        "email": "jobs@example.com"
                      }
                    },
                    "jobLocation": {
                      "@type": "Place",
                      "address": {
                        "@type": "PostalAddress",
                        "addressLocality": "Birmingham",
                        "addressRegion": "West Midlands",
                        "addressCountry": "UK"
                      }
                    },
                    "baseSalary": {
                      "@type": "MonetaryAmount",
                      "currency": "GBP",
                      "value": {
                        "@type": "QuantitativeValue",
                        "minValue": 30000,
                        "maxValue": 35000,
                        "unitText": "YEAR"
                      }
                    },
                    "description":
                      "<p>Build <strong>backend</strong> services and APIs for customers.</p>",
                    "skills": "<b>Java</b>, Spring Boot",
                    "qualifications": "Computer Science degree",
                    "jobBenefits": "<p>Hybrid working &amp; pension</p>",
                    "validThrough": "2026-09-15T23:59:59Z"
                  }
                  </script>
                </head>
                <body></body>
                </html>
                """;

        JobImportPreview preview =
                extractor.extract(
                        fetchedPage(html)
                );

        assertEquals(
                "Graduate Software Engineer",
                preview.jobTitle()
        );
        assertEquals(
                "Example Ltd",
                preview.company()
        );
        assertEquals(
                "Birmingham, West Midlands, UK",
                preview.location()
        );
        assertEquals(
                "GBP 30000 - 35000 YEAR",
                preview.salary()
        );
        assertEquals(
                "Build backend services and APIs for customers.",
                preview.jobDescription()
        );
        assertTrue(
                preview.requiredSkills()
                        .contains("Java, Spring Boot")
        );
        assertFalse(
                preview.requiredSkills()
                        .contains("<b>")
        );
        assertEquals(
                "Hybrid working & pension",
                preview.benefits()
        );
        assertEquals(
                "Jane Recruiter, jobs@example.com",
                preview.recruiter()
        );
        assertEquals(
                LocalDate.of(2026, 9, 15),
                preview.applicationDeadline()
        );
    }

    @Test
    void findsJobPostingInsideGraphAfterMalformedBlock() {
        String html = """
                <html>
                <head>
                  <script type="application/ld+json">
                    { definitely not valid json
                  </script>

                  <script type="application/ld+json">
                  {
                    "@context": "https://schema.org",
                    "@graph": [
                      {
                        "@type": "WebSite",
                        "name": "Example"
                      },
                      {
                        "@type": ["Thing", "JobPosting"],
                        "title": "Platform Engineer",
                        "hiringOrganization": {
                          "name": "Example Bank"
                        },
                        "jobLocation": {
                          "name": "London"
                        }
                      }
                    ]
                  }
                  </script>
                </head>
                <body></body>
                </html>
                """;

        JobImportPreview preview =
                extractor.extract(
                        fetchedPage(html)
                );

        assertEquals(
                "Platform Engineer",
                preview.jobTitle()
        );
        assertEquals(
                "Example Bank",
                preview.company()
        );
        assertEquals(
                "London",
                preview.location()
        );
    }

    @Test
    void mergesMissingStructuredFieldsFromHtml() {
        String html = """
                <html>
                <head>
                  <script type="application/ld+json">
                  {
                    "@type": "JobPosting",
                    "title": "Java Developer",
                    "hiringOrganization": {
                      "name": "Example Bank"
                    }
                  }
                  </script>
                </head>
                <body>
                  <main>
                    <h1>Java Developer</h1>
                    <div class="location">Birmingham</div>

                    <p>
                      Join our engineering team to design, build and support
                      reliable backend services used by customers across the
                      UK. You will collaborate with engineers, testers and
                      product colleagues throughout the development lifecycle.
                    </p>

                    <h2>Responsibilities</h2>
                    <p>Build APIs and maintain backend services.</p>

                    <h2>Requirements</h2>
                    <p>Java, Spring Boot, SQL and Git.</p>

                    <h2>Benefits</h2>
                    <p>Hybrid working and pension.</p>
                  </main>
                </body>
                </html>
                """;

        JobImportPreview preview =
                extractor.extract(
                        fetchedPage(html)
                );

        assertEquals(
                "Example Bank",
                preview.company()
        );
        assertEquals(
                "Birmingham",
                preview.location()
        );
        assertEquals(
                "Java, Spring Boot, SQL and Git.",
                preview.requiredSkills()
        );
        assertEquals(
                "Hybrid working and pension.",
                preview.benefits()
        );
    }

    @Test
    void extractsConfidentHtmlFallback() {
        String html = """
                <html>
                <head>
                  <meta property="og:site_name"
                        content="Example Technology">
                </head>
                <body>
                  <main>
                    <h1>Graduate Software Engineer</h1>

                    <div class="location">Birmingham</div>
                    <div class="salary">£30,000 - £35,000</div>

                    <p>
                      This graduate software engineering role works across
                      backend services, web applications and cloud APIs.
                      You will work closely with experienced engineers while
                      writing tested and maintainable software for real users.
                    </p>

                    <h2>Responsibilities</h2>
                    <p>
                      Build product features, APIs and automated tests.
                    </p>

                    <h2>Requirements</h2>
                    <ul>
                      <li>Java or Python</li>
                      <li>Git and SQL</li>
                    </ul>

                    <h2>Benefits</h2>
                    <p>Training, pension and hybrid working.</p>

                    <p>
                      <strong>Closing date:</strong>
                      <span>31 August 2026</span>
                    </p>
                  </main>
                </body>
                </html>
                """;

        JobImportPreview preview =
                extractor.extract(
                        fetchedPage(html)
                );

        assertEquals(
                "Graduate Software Engineer",
                preview.jobTitle()
        );
        assertEquals(
                "Example Technology",
                preview.company()
        );
        assertEquals(
                "Birmingham",
                preview.location()
        );
        assertEquals(
                "£30,000 - £35,000",
                preview.salary()
        );
        assertTrue(
                preview.requiredSkills()
                        .contains("Java or Python")
        );
        assertTrue(
                preview.benefits()
                        .contains("Training")
        );
        assertEquals(
                LocalDate.of(2026, 8, 31),
                preview.applicationDeadline()
        );
    }

    @Test
    void rejectsArbitraryNonJobPage() {
        String html = """
                <html>
                <body>
                  <article>
                    <h1>How modern software teams collaborate</h1>

                    <h2>Introduction</h2>
                    <p>
                      Software teams use many different processes, tools,
                      communication styles and engineering practices.
                      This article discusses collaboration, documentation,
                      testing, architecture, product design and long-term
                      maintainability across modern technology organisations.
                    </p>

                    <h2>Conclusion</h2>
                    <p>
                      Effective collaboration requires clear communication,
                      thoughtful planning and continuous improvement.
                    </p>
                  </article>
                </body>
                </html>
                """;

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> extractor.extract(
                                fetchedPage(html)
                        )
                );

        assertEquals(
                EXTRACTION_FAILED,
                exception.getReason()
        );
    }

    @Test
    void truncatesImportedFieldsToApplicationLimits() {
        String company = "c".repeat(205);
        String title = "t".repeat(205);
        String location = "l".repeat(205);
        String salary = "s".repeat(205);
        String description = "d".repeat(20_005);
        String skills = "k".repeat(10_005);
        String benefits = "b".repeat(10_005);
        String recruiter = "r".repeat(205);

        String html = """
                <html>
                <head>
                  <script type="application/ld+json">
                  {
                    "@type": "JobPosting",
                    "title": "%s",
                    "hiringOrganization": {
                      "name": "%s",
                      "contactPoint": {
                        "name": "%s"
                      }
                    },
                    "jobLocation": {
                      "name": "%s"
                    },
                    "baseSalary": "%s",
                    "description": "%s",
                    "skills": "%s",
                    "jobBenefits": "%s"
                  }
                  </script>
                </head>
                </html>
                """.formatted(
                title,
                company,
                recruiter,
                location,
                salary,
                description,
                skills,
                benefits
        );

        JobImportPreview preview =
                extractor.extract(
                        fetchedPage(html)
                );

        assertEquals(
                200,
                preview.company().length()
        );
        assertEquals(
                200,
                preview.jobTitle().length()
        );
        assertEquals(
                200,
                preview.location().length()
        );
        assertEquals(
                200,
                preview.salary().length()
        );
        assertEquals(
                20_000,
                preview.jobDescription().length()
        );
        assertEquals(
                10_000,
                preview.requiredSkills().length()
        );
        assertEquals(
                10_000,
                preview.benefits().length()
        );
        assertEquals(
                200,
                preview.recruiter().length()
        );

        assertTrue(
                preview.warnings()
                        .stream()
                        .anyMatch(warning ->
                                warning.contains(
                                        "shortened"
                                )
                        )
        );
    }

    @Test
    void choosesRichestOfMultipleJobPostings() {
        String html = """
                <html>
                <head>
                  <script type="application/ld+json">
                  [
                    {
                      "@type": "JobPosting",
                      "title": "Old Vacancy",
                      "hiringOrganization": {
                        "name": "Example"
                      }
                    },
                    {
                      "@type": "JobPosting",
                      "title": "Backend Engineer",
                      "hiringOrganization": {
                        "name": "Example Bank"
                      },
                      "jobLocation": {
                        "name": "Birmingham"
                      },
                      "description":
                        "Build reliable backend services and APIs for customers while working closely with an experienced engineering team."
                    }
                  ]
                  </script>
                </head>
                </html>
                """;

        JobImportPreview preview =
                extractor.extract(
                        fetchedPage(html)
                );

        assertEquals(
                "Backend Engineer",
                preview.jobTitle()
        );
        assertEquals(
                "Example Bank",
                preview.company()
        );
        assertEquals(
                "Birmingham",
                preview.location()
        );
    }

    @Test
    void returnsBlankOptionalFieldsWithPartialWarning() {
        String html = """
                <html>
                <head>
                  <script type="application/ld+json">
                  {
                    "@type": "JobPosting",
                    "title": "Software Engineer",
                    "hiringOrganization": {
                      "name": "Example Ltd"
                    }
                  }
                  </script>
                </head>
                </html>
                """;

        JobImportPreview preview =
                extractor.extract(
                        fetchedPage(html)
                );

        assertEquals(
                "",
                preview.location()
        );
        assertEquals(
                "",
                preview.salary()
        );
        assertEquals(
                "",
                preview.requiredSkills()
        );
        assertEquals(
                "",
                preview.benefits()
        );

        assertFalse(
                preview.warnings().isEmpty()
        );
    }

    private SafeJobPageFetcher.FetchedPage
            fetchedPage(String html) {

        return new SafeJobPageFetcher.FetchedPage(
                URI.create(
                        "https://jobs.example.com/123"
                ),
                "jobs.example.com",
                html
        );
    }
}