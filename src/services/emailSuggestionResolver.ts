import type {
  ApplicationStatus,
  JobApplication,
} from "./applicationService";

import type {
  RecruitmentEmailCategory,
  RecruitmentEmailSuggestion,
} from "../types/emailIntegration";

export type EmailSuggestionResolutionKind =
  | "ACTIONABLE"
  | "NO_CHANGE"
  | "STALE"
  | "NEEDS_APPLICATION"
  | "INFORMATIONAL";

export type EmailSuggestionResolution = {
  kind: EmailSuggestionResolutionKind;
  targetStatus: ApplicationStatus | null;
  canConfirm: boolean;
  reason: string;
};

export type EmailApplicationPrefill = {
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
};

const REJECTION_STALE_TOLERANCE_MS =
  5 * 60 * 1000;

function statusRank(
  status: ApplicationStatus,
): number {
  switch (status) {
    case "Saved":
      return 0;
    case "Applied":
      return 1;
    case "Assessment":
      return 2;
    case "Interview":
      return 3;
    case "Offer":
      return 4;
    case "Rejected":
      return 5;
  }
}

export function targetStatusForRecruitmentCategory(
  category: RecruitmentEmailCategory,
): ApplicationStatus | null {
  switch (category) {
    case "APPLICATION_RECEIVED":
      return "Applied";

    case "ASSESSMENT":
      return "Assessment";

    case "INTERVIEW":
      return "Interview";

    case "OFFER":
      return "Offer";

    case "REJECTION":
      return "Rejected";

    case "FOLLOW_UP":
    case "UNKNOWN":
      return null;
  }
}

function cleanPrefillText(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[\s:–—-]+/, "")
    .replace(/[\s:–—-]+$/, "")
    .trim();
}

function senderDisplayName(
  sender: string,
): string {
  const beforeAddress =
    sender.split("<")[0]?.trim() ?? "";

  if (
    !beforeAddress ||
    beforeAddress.includes("@")
  ) {
    return "";
  }

  return cleanPrefillText(
    beforeAddress,
  );
}

function isGenericSenderName(
  value: string,
): boolean {
  return (
    !value ||
    /recruitment|recruiter|careers|talent|notification|automatic|e-business|noreply|no-reply|workday|oracle|greenhouse|lever|human resources|\bhr\b/i.test(
      value,
    )
  );
}

export function deriveApplicationPrefillFromSuggestion(
  suggestion: RecruitmentEmailSuggestion,
): EmailApplicationPrefill {
  const subject =
    suggestion.emailSubject.trim();

  let company = "";
  let jobTitle = "";

  /*
   * Example:
   * "Your application for the Crew Member with Five Guys"
   */
  const explicitApplication =
    subject.match(
      /(?:your\s+)?application\s+for\s+(?:the\s+)?(.+?)\s+(?:with|at)\s+(.+)$/i,
    );

  if (explicitApplication) {
    jobTitle =
      cleanPrefillText(
        explicitApplication[1] ?? "",
      );

    company =
      cleanPrefillText(
        explicitApplication[2] ?? "",
      );
  }

  /*
   * Example:
   * "Interview invitation - Graduate Software Engineer"
   */
  if (!jobTitle) {
    const roleOnly =
      subject.match(
        /(?:interview(?: invitation)?|assessment(?: invitation)?|coding challenge|job offer|offer(?: of employment)?)\s*[:\-–—]\s*(.+)$/i,
      );

    if (roleOnly) {
      jobTitle =
        cleanPrefillText(
          roleOnly[1] ?? "",
        );
    }
  }

  if (!company) {
    const senderName =
      senderDisplayName(
        suggestion.senderDisplay,
      );

    if (
      !isGenericSenderName(
        senderName,
      )
    ) {
      company = senderName;
    }
  }

  return {
    company,
    jobTitle,
    status:
      targetStatusForRecruitmentCategory(
        suggestion.detectedType,
      ) ?? "Applied",
  };
}

export function resolveRecruitmentEmailSuggestion(
  suggestion: RecruitmentEmailSuggestion,
  application?: JobApplication,
): EmailSuggestionResolution {
  const targetStatus =
    targetStatusForRecruitmentCategory(
      suggestion.detectedType,
    );

  if (!targetStatus) {
    return {
      kind: "INFORMATIONAL",
      targetStatus: null,
      canConfirm: false,
      reason:
        "This email does not contain a status change ApplyMate can safely apply.",
    };
  }

  if (!application) {
    return {
      kind: "NEEDS_APPLICATION",
      targetStatus,
      canConfirm: false,
      reason:
        "Choose an existing application or create a new one before confirming this update.",
    };
  }

  if (
    application.status ===
    targetStatus
  ) {
    return {
      kind: "NO_CHANGE",
      targetStatus,
      canConfirm: true,
      reason:
        `This application is already marked ${targetStatus}. Confirming will simply mark the email as handled.`,
    };
  }

  /*
   * Never automatically revive a rejected
   * application from an older/different email.
   */
  if (
    application.status === "Rejected"
  ) {
    return {
      kind: "STALE",
      targetStatus,
      canConfirm: false,
      reason:
        "This application is already marked Rejected. ApplyMate will not automatically move it back to an earlier stage.",
    };
  }

  /*
   * A rejection can happen from any active stage,
   * so chronology matters more than stage ranking.
   */
  if (targetStatus === "Rejected") {
    const emailTime =
      Date.parse(
        suggestion.receivedAt,
      );

    const updatedTime =
      application.updatedAt
        ? Date.parse(
            application.updatedAt,
          )
        : Number.NaN;

    if (
      !Number.isNaN(emailTime) &&
      !Number.isNaN(updatedTime) &&
      emailTime +
        REJECTION_STALE_TOLERANCE_MS <
        updatedTime
    ) {
      return {
        kind: "STALE",
        targetStatus,
        canConfirm: false,
        reason:
          "This rejection email is older than the application's latest update, so ApplyMate will not apply it.",
      };
    }

    return {
      kind: "ACTIONABLE",
      targetStatus,
      canConfirm: true,
      reason:
        `The email suggests changing this application from ${application.status} to Rejected.`,
    };
  }

  if (
    statusRank(targetStatus) <
    statusRank(application.status)
  ) {
    return {
      kind: "STALE",
      targetStatus,
      canConfirm: false,
      reason:
        `This email refers to an earlier stage. The application is already at ${application.status}, so ApplyMate will not move it backwards.`,
    };
  }

  return {
    kind: "ACTIONABLE",
    targetStatus,
    canConfirm: true,
    reason:
      `The email suggests changing this application from ${application.status} to ${targetStatus}.`,
  };
}

export function shouldSurfaceRecruitmentSuggestion(
  suggestion: RecruitmentEmailSuggestion,
  application?: JobApplication,
): boolean {
  if (
    suggestion.state !== "PENDING" ||
    suggestion.detectionConfidence ===
      "LOW"
  ) {
    return false;
  }

  const resolution =
    resolveRecruitmentEmailSuggestion(
      suggestion,
      application,
    );

  if (
    resolution.kind === "STALE" ||
    resolution.kind === "NO_CHANGE"
  ) {
    return false;
  }

  if (
    resolution.kind ===
    "INFORMATIONAL"
  ) {
    return (
      suggestion.detectionConfidence ===
        "HIGH" &&
      Boolean(application)
    );
  }

  if (
    resolution.kind ===
    "NEEDS_APPLICATION"
  ) {
    if (
      suggestion.detectionConfidence ===
      "HIGH"
    ) {
      return true;
    }

    /*
     * MEDIUM unmatched emails are retained only
     * when the subject gives us strong structured
     * company + role information.
     *
     * This keeps useful Five Guys-style emails
     * while suppressing vague "Application Outcome"
     * noise from generic ATS senders.
     */
    if (
      suggestion.detectionConfidence ===
      "MEDIUM"
    ) {
      const prefill =
        deriveApplicationPrefillFromSuggestion(
          suggestion,
        );

      return Boolean(
        prefill.company &&
        prefill.jobTitle,
      );
    }

    return false;
  }

  return true;
}