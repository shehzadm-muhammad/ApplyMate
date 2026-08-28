import {
  detectRecruitmentEmail,
} from "../services/recruitmentEmailDetector";

import {
  matchRecruitmentEmailToApplication,
} from "../services/recruitmentEmailMatcher";

import type {
  GmailMessageMetadata,
} from "../types/emailIntegration";

import type {
  JobApplication,
} from "../services/applicationService";

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(
      `CHECK FAILED: ${message}`,
    );
  }
}

function metadata(
  overrides: Partial<GmailMessageMetadata>,
): GmailMessageMetadata {
  return {
    providerMessageId: "message-1",
    providerThreadId: "thread-1",
    receivedAt:
      "2026-08-20T10:00:00.000Z",
    sender:
      "Recruitment <careers@example.com>",
    subject: "",
    snippet: "",
    ...overrides,
  };
}

const applications: JobApplication[] = [
  {
    id: "barclays-software",
    jobUrl:
      "https://search.jobs.barclays/software",
    company: "Barclays",
    jobTitle:
      "Graduate Software Engineer",
    location: "Birmingham",
    salary: "",
    status: "Applied",
    notes: "",
    jobDescription: "",
    requiredSkills: "",
    benefits: "",
    recruiter: "",
    applicationDeadline: "",
    createdAt:
      "2026-08-01T09:00:00.000Z",
  },
  {
    id: "barclays-service",
    jobUrl:
      "https://search.jobs.barclays/service",
    company: "Barclays",
    jobTitle:
      "Customer Service Advisor",
    location: "Birmingham",
    salary: "",
    status: "Applied",
    notes: "",
    jobDescription: "",
    requiredSkills: "",
    benefits: "",
    recruiter: "",
    applicationDeadline: "",
    createdAt:
      "2026-08-01T09:00:00.000Z",
  },
  {
    id: "hsbc-developer",
    jobUrl:
      "https://www.hsbc.com/careers/developer",
    company: "HSBC",
    jobTitle:
      "Graduate Developer",
    location: "Birmingham",
    salary: "",
    status: "Applied",
    notes: "",
    jobDescription: "",
    requiredSkills: "",
    benefits: "",
    recruiter: "",
    applicationDeadline: "",
    createdAt:
      "2026-08-02T09:00:00.000Z",
  },
];

const interview =
  detectRecruitmentEmail({
    metadata: metadata({
      subject:
        "Interview invitation - Graduate Software Engineer",
      snippet:
        "We would like to invite you to an interview.",
    }),
  });

assert(
  interview.category ===
    "INTERVIEW",
  "Interview should be detected.",
);

assert(
  interview.confidence ===
    "HIGH",
  "Interview should be high confidence.",
);

assert(
  interview.requiresBody ===
    false,
  "Strong metadata should not require body retrieval.",
);

const ambiguous =
  detectRecruitmentEmail({
    metadata: metadata({
      subject:
        "Your application",
      snippet:
        "We have an update regarding your application.",
    }),
  });

assert(
  ambiguous.requiresBody,
  "Ambiguous application metadata should request body context.",
);

const rejection =
  detectRecruitmentEmail({
    metadata: metadata({
      subject:
        "Application update",
      snippet:
        "Unfortunately, we will not be progressing your application.",
    }),
  });

assert(
  rejection.category ===
    "REJECTION",
  "Rejection should be detected.",
);

assert(
  rejection.confidence ===
    "HIGH",
  "Explicit rejection should be high confidence.",
);

const unrelated =
  detectRecruitmentEmail({
    metadata: metadata({
      sender:
        "Shop <orders@example.com>",
      subject:
        "Your grocery receipt",
      snippet:
        "Thank you for shopping with us.",
    }),
  });

assert(
  unrelated.category ===
    "UNKNOWN",
  "Unrelated email should remain unknown.",
);

assert(
  unrelated.requiresBody ===
    false,
  "Clearly unrelated email must not trigger body retrieval.",
);

const exactMatch =
  matchRecruitmentEmailToApplication({
    metadata: metadata({
      sender:
        "Barclays Recruitment <careers@barclays.com>",
      subject:
        "Barclays interview invitation - Graduate Software Engineer",
      snippet:
        "We would like to invite you to interview for the Graduate Software Engineer role.",
    }),
    applications,
  });

assert(
  exactMatch.applicationId ===
    "barclays-software",
  "Company/title email should match the correct Barclays application.",
);

assert(
  exactMatch.confidence ===
    "HIGH",
  "Strong company/title match should be high confidence.",
);

const ambiguousCompanyMatch =
  matchRecruitmentEmailToApplication({
    metadata: metadata({
      sender:
        "Barclays Recruitment <careers@barclays.com>",
      subject:
        "Barclays application update",
      snippet:
        "There is an update to your application.",
    }),
    applications,
  });

assert(
  ambiguousCompanyMatch.applicationId ===
    null,
  "Company-only email must not choose between two Barclays applications.",
);

console.log(
  "Email integration logic checks passed.",
);