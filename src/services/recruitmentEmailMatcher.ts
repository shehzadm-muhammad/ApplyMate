import type {
  ApplicationMatch,
  GmailMessageMetadata,
} from "../types/emailIntegration";

import type {
  JobApplication,
} from "./applicationService";

type MatchInput = {
  metadata: GmailMessageMetadata;
  bodyText?: string | null;
  applications: JobApplication[];
};

type ScoredApplication = {
  application: JobApplication;
  score: number;
  evidence: string[];
};

const TITLE_STOP_WORDS = new Set([
  "and",
  "the",
  "for",
  "with",
  "of",
  "a",
  "an",
  "to",
  "in",
  "at",
]);

const COMPANY_SUFFIXES = new Set([
  "limited",
  "ltd",
  "plc",
  "inc",
  "llc",
  "group",
  "company",
  "co",
]);

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCompany(
  company: string,
): string {
  const tokens =
    normalizeText(company)
      .split(" ")
      .filter(Boolean);

  while (
    tokens.length > 1 &&
    COMPANY_SUFFIXES.has(
      tokens[
        tokens.length - 1
      ],
    )
  ) {
    tokens.pop();
  }

  return tokens.join(" ");
}

function tokenizeJobTitle(
  jobTitle: string,
): string[] {
  return normalizeText(jobTitle)
    .split(" ")
    .filter(
      (token) =>
        token.length >= 2 &&
        !TITLE_STOP_WORDS.has(token),
    );
}

function containsPhrase(
  normalizedText: string,
  normalizedPhrase: string,
): boolean {
  if (!normalizedPhrase) {
    return false;
  }

  return ` ${normalizedText} `.includes(
    ` ${normalizedPhrase} `,
  );
}

function extractSenderDomain(
  sender: string,
): string | null {
  const match = sender.match(
    /[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i,
  );

  return match?.[1]
    ?.toLowerCase() ?? null;
}

function getJobUrlHost(
  jobUrl: string,
): string | null {
  if (!jobUrl.trim()) {
    return null;
  }

  try {
    return new URL(
      jobUrl,
    ).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return null;
  }
}

function titleCoverage(
  titleTokens: string[],
  normalizedText: string,
): number {
  if (titleTokens.length === 0) {
    return 0;
  }

  const textTokens =
    new Set(
      normalizedText
        .split(" ")
        .filter(Boolean),
    );

  const matched =
    titleTokens.filter(
      (token) =>
        textTokens.has(token),
    ).length;

  return matched /
    titleTokens.length;
}

function scoreApplication(
  application: JobApplication,
  normalizedContent: string,
  senderDomain: string | null,
  receivedAt: string,
): ScoredApplication {
  let score = 0;
  const evidence: string[] = [];

  const company =
    normalizeCompany(
      application.company,
    );

  const title =
    normalizeText(
      application.jobTitle,
    );

  const titleTokens =
    tokenizeJobTitle(
      application.jobTitle,
    );

  if (
    containsPhrase(
      normalizedContent,
      company,
    )
  ) {
    score += 40;
    evidence.push("company");
  }

  if (
    containsPhrase(
      normalizedContent,
      title,
    )
  ) {
    score += 30;
    evidence.push("job title");
  } else {
    const coverage =
      titleCoverage(
        titleTokens,
        normalizedContent,
      );

    if (coverage >= 0.75) {
      score += 25;
      evidence.push(
        "strong job-title overlap",
      );
    } else if (
      coverage >= 0.5
    ) {
      score += 15;
      evidence.push(
        "partial job-title overlap",
      );
    }
  }

  if (
    senderDomain &&
    company
  ) {
    const companyTokens =
      company
        .split(" ")
        .filter(
          (token) =>
            token.length >= 3,
        );

    if (
      companyTokens.some(
        (token) =>
          senderDomain.includes(
            token,
          ),
      )
    ) {
      score += 20;
      evidence.push(
        "sender domain",
      );
    }
  }

  const jobUrlHost =
    getJobUrlHost(
      application.jobUrl,
    );

  if (
    senderDomain &&
    jobUrlHost &&
    (
      senderDomain ===
        jobUrlHost ||
      senderDomain.endsWith(
        `.${jobUrlHost}`,
      ) ||
      jobUrlHost.endsWith(
        `.${senderDomain}`,
      )
    )
  ) {
    score += 10;
    evidence.push(
      "job URL domain",
    );
  }

  const emailDate =
    Date.parse(receivedAt);

  const applicationDate =
    Date.parse(
      application.createdAt,
    );

  if (
    !Number.isNaN(emailDate) &&
    !Number.isNaN(
      applicationDate,
    )
  ) {
    const earliestPlausible =
      applicationDate -
      3 * 24 * 60 * 60 * 1000;

    if (
      emailDate >=
      earliestPlausible
    ) {
      score += 5;
      evidence.push(
        "plausible date",
      );
    } else {
      score -= 15;
    }
  }

  return {
    application,
    score:
      Math.max(0, score),
    evidence,
  };
}

export function matchRecruitmentEmailToApplication({
  metadata,
  bodyText,
  applications,
}: MatchInput): ApplicationMatch {
  if (applications.length === 0) {
    return {
      applicationId: null,
      confidence: "LOW",
      score: 0,
      reason:
        "No ApplyMate applications are available to match.",
    };
  }

  const normalizedContent =
    normalizeText(
      [
        metadata.sender,
        metadata.subject,
        metadata.snippet,
        bodyText ?? "",
      ].join(" "),
    );

  const senderDomain =
    extractSenderDomain(
      metadata.sender,
    );

  const scored =
    applications
      .map((application) =>
        scoreApplication(
          application,
          normalizedContent,
          senderDomain,
          metadata.receivedAt,
        ),
      )
      .sort(
        (left, right) =>
          right.score -
          left.score,
      );

  const best =
    scored[0];

  const second =
    scored[1];

  if (!best) {
    return {
      applicationId: null,
      confidence: "LOW",
      score: 0,
      reason:
        "No application match was found.",
    };
  }

  const margin =
    best.score -
    (second?.score ?? 0);

  const evidence =
    best.evidence.length > 0
      ? best.evidence.join(", ")
      : "limited evidence";

  if (
    best.score >= 70 &&
    margin >= 15
  ) {
    return {
      applicationId:
        best.application.id,
      confidence: "HIGH",
      score: best.score,
      reason:
        `Matched using ${evidence}.`,
    };
  }

  if (
    best.score >= 50 &&
    margin >= 10
  ) {
    return {
      applicationId:
        best.application.id,
      confidence: "MEDIUM",
      score: best.score,
      reason:
        `Possible match using ${evidence}.`,
    };
  }

  return {
    applicationId: null,
    confidence: "LOW",
    score: best.score,
    reason:
      "No application could be matched confidently.",
  };
}