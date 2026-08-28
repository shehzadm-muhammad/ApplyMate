import {
  getApplications,
  updateApplication,
  type ApplicationFormValues,
  type ApplicationStatus,
  type JobApplication,
} from "./applicationService";

import {
  getAuthorizedGmailAccessToken,
  refreshAuthorizedGmailAccessToken,
} from "./gmailAuthService";

import {
  getGmailConnection,
  saveGmailConnection,
} from "./gmailConnectionStorage";

import {
  GmailApiError,
  getGmailMessageMetadata,
  getGmailMessageTextBody,
  listRecruitmentMessageIds,
} from "./gmailApiService";

import {
  detectRecruitmentEmail,
} from "./recruitmentEmailDetector";

import {
  matchRecruitmentEmailToApplication,
} from "./recruitmentEmailMatcher";

import {
  getEmailIntegrationState,
  saveEmailIntegrationState,
} from "./emailIntegrationStorage";

import {
  resolveRecruitmentEmailSuggestion,
  shouldSurfaceRecruitmentSuggestion,
  targetStatusForRecruitmentCategory,
} from "./emailSuggestionResolver";

import type {
  EmailSyncResult,
  RecruitmentEmailSuggestion,
} from "../types/emailIntegration";

export type EmailSuggestionActionErrorCode =
  | "NOT_FOUND"
  | "ALREADY_REVIEWED"
  | "APPLICATION_REQUIRED"
  | "APPLICATION_NOT_FOUND"
  | "NO_STATUS_CHANGE"
  | "STATUS_REGRESSION";

export class EmailSuggestionActionError extends Error {
  constructor(
    public readonly code:
      EmailSuggestionActionErrorCode,
    message: string,
  ) {
    super(message);
    this.name =
      "EmailSuggestionActionError";
  }
}

export type EmailSuggestionConfirmationResult = {
  applicationId: string;
  status: ApplicationStatus;
  applicationUpdated: boolean;
};

function createSuggestionId(
  googleAccountId: string,
  providerMessageId: string,
): string {
  return `${googleAccountId}:${providerMessageId}`;
}

function toApplicationFormValues(
  application: JobApplication,
  status: ApplicationStatus,
): ApplicationFormValues {
  return {
    jobUrl: application.jobUrl,
    company: application.company,
    jobTitle: application.jobTitle,
    location: application.location,
    salary: application.salary,
    status,
    notes: application.notes,

    jobDescription:
      application.jobDescription,
    requiredSkills:
      application.requiredSkills,
    benefits: application.benefits,
    recruiter: application.recruiter,
    applicationDeadline:
      application.applicationDeadline,
  };
}

async function syncRecruitmentEmailsWithToken(
  applyMateUserId: string,
  accessToken: string,
): Promise<EmailSyncResult> {
  const connection =
    await getGmailConnection(
      applyMateUserId,
    );

  if (!connection) {
    throw new Error(
      "Gmail is not connected.",
    );
  }

  const [
    applications,
    storedState,
  ] = await Promise.all([
    getApplications(),
    getEmailIntegrationState(
      applyMateUserId,
      connection.googleAccountId,
    ),
  ]);

  const processedIds =
    new Set(
      storedState.processedMessages.map(
        (message) =>
          message.providerMessageId,
      ),
    );

  const references =
    await listRecruitmentMessageIds(
      accessToken,
      connection.lastSyncAt,
    );

  const unseen =
    references.filter(
      (reference) =>
        !processedIds.has(
          reference.providerMessageId,
        ),
    );

  const processedMessages = [
    ...storedState.processedMessages,
  ];

  const suggestions = [
    ...storedState.suggestions,
  ];

  let metadataFetched = 0;
  let bodiesFetched = 0;
  let suggestionsCreated = 0;

  for (const reference of unseen) {
    const metadata =
      await getGmailMessageMetadata(
        accessToken,
        reference.providerMessageId,
      );

    metadataFetched += 1;

    let detection =
      detectRecruitmentEmail({
        metadata,
      });

    let bodyText: string | null =
      null;

    if (detection.requiresBody) {
      bodyText =
        await getGmailMessageTextBody(
          accessToken,
          reference.providerMessageId,
        );

      bodiesFetched += 1;

      detection =
        detectRecruitmentEmail({
          metadata,
          bodyText,
        });
    }

    const processedAt =
      new Date().toISOString();

    processedMessages.push({
      providerMessageId:
        reference.providerMessageId,
      processedAt,
    });

    if (
      detection.category ===
        "UNKNOWN" ||
      detection.confidence ===
        "LOW"
    ) {
      continue;
    }

    const match =
      matchRecruitmentEmailToApplication({
        metadata,
        bodyText,
        applications,
      });

    const matchedApplication =
      match.applicationId
        ? applications.find(
            (application) =>
              application.id ===
              match.applicationId,
          )
        : undefined;

    const suggestion:
      RecruitmentEmailSuggestion = {
        id: createSuggestionId(
          connection.googleAccountId,
          reference.providerMessageId,
        ),

        applyMateUserId,
        googleAccountId:
          connection.googleAccountId,

        providerMessageId:
          reference.providerMessageId,
        providerThreadId:
          reference.providerThreadId,

        receivedAt:
          metadata.receivedAt,

        detectedType:
          detection.category,
        detectionConfidence:
          detection.confidence,

        matchedApplicationId:
          match.applicationId,
        matchConfidence:
          match.confidence,

        suggestedStatus:
          targetStatusForRecruitmentCategory(
            detection.category,
          ),

        detectionReason:
          detection.reason,
        matchReason:
          match.reason,

        emailSubject:
          metadata.subject,
        senderDisplay:
          metadata.sender,

        state: "PENDING",
        createdAt: processedAt,
      };

    if (
      suggestions.some(
        (existing) =>
          existing.id ===
          suggestion.id,
      )
    ) {
      continue;
    }

    if (
      !shouldSurfaceRecruitmentSuggestion(
        suggestion,
        matchedApplication,
      )
    ) {
      continue;
    }

    suggestions.push(suggestion);
    suggestionsCreated += 1;
  }

  const completedAt =
    new Date().toISOString();

  await saveEmailIntegrationState(
    applyMateUserId,
    connection.googleAccountId,
    {
      version: 1,
      processedMessages,
      suggestions,
    },
  );

  const saved =
    await saveGmailConnection({
      ...connection,
      lastSyncAt: completedAt,
    });

  if (!saved) {
    throw new Error(
      "Gmail connection ownership changed during sync.",
    );
  }

  return {
    candidateIdsFound:
      references.length,
    alreadyProcessed:
      references.length -
      unseen.length,
    metadataFetched,
    bodiesFetched,
    suggestionsCreated,
    completedAt,
  };
}

export async function syncRecruitmentEmails(
  applyMateUserId: string,
): Promise<EmailSyncResult> {
  const accessToken =
    await getAuthorizedGmailAccessToken(
      applyMateUserId,
    );

  try {
    return await syncRecruitmentEmailsWithToken(
      applyMateUserId,
      accessToken,
    );
  } catch (error) {
    if (
      error instanceof GmailApiError &&
      error.status === 401
    ) {
      const freshAccessToken =
        await refreshAuthorizedGmailAccessToken(
          applyMateUserId,
          accessToken,
        );

      return syncRecruitmentEmailsWithToken(
        applyMateUserId,
        freshAccessToken,
      );
    }

    throw error;
  }
}

export async function getRecruitmentEmailSuggestions(
  applyMateUserId: string,
): Promise<RecruitmentEmailSuggestion[]> {
  const connection =
    await getGmailConnection(
      applyMateUserId,
    );

  if (!connection) {
    return [];
  }

  const [
    state,
    applications,
  ] = await Promise.all([
    getEmailIntegrationState(
      applyMateUserId,
      connection.googleAccountId,
    ),
    getApplications(),
  ]);

  return state.suggestions.filter(
    (suggestion) => {
      if (
        suggestion.state !==
        "PENDING"
      ) {
        return true;
      }

      const application =
        suggestion.matchedApplicationId
          ? applications.find(
              (candidate) =>
                candidate.id ===
                suggestion.matchedApplicationId,
            )
          : undefined;

      return shouldSurfaceRecruitmentSuggestion(
        suggestion,
        application,
      );
    },
  );
}

export async function ignoreRecruitmentEmailSuggestion(
  applyMateUserId: string,
  suggestionId: string,
): Promise<void> {
  const connection =
    await getGmailConnection(
      applyMateUserId,
    );

  if (!connection) {
    throw new EmailSuggestionActionError(
      "NOT_FOUND",
      "The Gmail connection is no longer available.",
    );
  }

  const state =
    await getEmailIntegrationState(
      applyMateUserId,
      connection.googleAccountId,
    );

  const index =
    state.suggestions.findIndex(
      (suggestion) =>
        suggestion.id ===
          suggestionId &&
        suggestion.applyMateUserId ===
          applyMateUserId &&
        suggestion.googleAccountId ===
          connection.googleAccountId,
    );

  if (index < 0) {
    throw new EmailSuggestionActionError(
      "NOT_FOUND",
      "The email suggestion could not be found.",
    );
  }

  const suggestion =
    state.suggestions[index];

  if (
    suggestion.state !== "PENDING"
  ) {
    throw new EmailSuggestionActionError(
      "ALREADY_REVIEWED",
      "This email suggestion has already been reviewed.",
    );
  }

  state.suggestions[index] = {
    ...suggestion,
    state: "IGNORED",
  };

  await saveEmailIntegrationState(
    applyMateUserId,
    connection.googleAccountId,
    state,
  );
}

export async function confirmRecruitmentEmailSuggestion(
  applyMateUserId: string,
  suggestionId: string,
  selectedApplicationId?: string,
): Promise<EmailSuggestionConfirmationResult> {
  const connection =
    await getGmailConnection(
      applyMateUserId,
    );

  if (!connection) {
    throw new EmailSuggestionActionError(
      "NOT_FOUND",
      "The Gmail connection is no longer available.",
    );
  }

  const state =
    await getEmailIntegrationState(
      applyMateUserId,
      connection.googleAccountId,
    );

  const index =
    state.suggestions.findIndex(
      (suggestion) =>
        suggestion.id ===
          suggestionId &&
        suggestion.applyMateUserId ===
          applyMateUserId &&
        suggestion.googleAccountId ===
          connection.googleAccountId,
    );

  if (index < 0) {
    throw new EmailSuggestionActionError(
      "NOT_FOUND",
      "The email suggestion could not be found.",
    );
  }

  const suggestion =
    state.suggestions[index];

  if (
    suggestion.state !== "PENDING"
  ) {
    throw new EmailSuggestionActionError(
      "ALREADY_REVIEWED",
      "This email suggestion has already been reviewed.",
    );
  }

  const applicationId =
    selectedApplicationId ??
    suggestion.matchedApplicationId;

  if (!applicationId) {
    throw new EmailSuggestionActionError(
      "APPLICATION_REQUIRED",
      "Choose the application this email belongs to.",
    );
  }

  /*
   * Always reload current applications here.
   * Never trust application status captured
   * during the earlier Gmail sync.
   */
  const applications =
    await getApplications();

  const application =
    applications.find(
      (candidate) =>
        candidate.id === applicationId,
    );

  if (!application) {
    throw new EmailSuggestionActionError(
      "APPLICATION_NOT_FOUND",
      "The selected application no longer exists.",
    );
  }

  const resolution =
    resolveRecruitmentEmailSuggestion(
      suggestion,
      application,
    );

  if (
    resolution.kind === "STALE"
  ) {
    throw new EmailSuggestionActionError(
      "STATUS_REGRESSION",
      resolution.reason,
    );
  }

  if (
    resolution.kind ===
      "INFORMATIONAL" ||
    !resolution.targetStatus
  ) {
    throw new EmailSuggestionActionError(
      "NO_STATUS_CHANGE",
      resolution.reason,
    );
  }

  let applicationUpdated = false;

  if (
    resolution.kind ===
    "ACTIONABLE"
  ) {
    await updateApplication(
      application.id,
      toApplicationFormValues(
        application,
        resolution.targetStatus,
      ),
    );

    applicationUpdated = true;
  }

  /*
   * NO_CHANGE is also considered successfully
   * handled, but no backend write is necessary.
   */
  state.suggestions[index] = {
    ...suggestion,
    matchedApplicationId:
      application.id,
    matchConfidence: "HIGH",
    suggestedStatus:
      resolution.targetStatus,
    matchReason:
      application.id ===
      suggestion.matchedApplicationId
        ? suggestion.matchReason
        : "Application selected by the user during review.",
    state: "CONFIRMED",
  };

  /*
   * Only mark confirmed after any required
   * application update has succeeded.
   */
  await saveEmailIntegrationState(
    applyMateUserId,
    connection.googleAccountId,
    state,
  );

  return {
    applicationId:
      application.id,
    status:
      resolution.targetStatus,
    applicationUpdated,
  };
}