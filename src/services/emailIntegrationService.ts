import {
  getApplications,
  type ApplicationStatus,
  type JobApplication,
} from "./applicationService";

import {
  getAuthorizedGmailAccessToken,
} from "./gmailAuthService";

import {
  getGmailConnection,
  saveGmailConnection,
} from "./gmailConnectionStorage";

import {
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

import type {
  EmailSyncResult,
  RecruitmentEmailCategory,
  RecruitmentEmailSuggestion,
} from "../types/emailIntegration";

function mapCategoryToStatus(
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

function safeSuggestedStatus(
  application: JobApplication | undefined,
  detectedStatus: ApplicationStatus | null,
): ApplicationStatus | null {
  if (
    !application ||
    !detectedStatus
  ) {
    return detectedStatus;
  }

  /*
   * Never suggest regression to an earlier
   * normal recruitment stage.
   */
  if (
    detectedStatus !== "Rejected" &&
    application.status !== "Rejected" &&
    statusRank(detectedStatus) <
      statusRank(application.status)
  ) {
    return null;
  }

  if (
    application.status ===
      detectedStatus
  ) {
    return null;
  }

  return detectedStatus;
}

function createSuggestionId(
  googleAccountId: string,
  providerMessageId: string,
): string {
  return `${googleAccountId}:${providerMessageId}`;
}

export async function syncRecruitmentEmails(
  applyMateUserId: string,
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

  const accessToken =
    await getAuthorizedGmailAccessToken(
      applyMateUserId,
    );

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

    /*
     * Full body text is deliberately not added
     * to storage and becomes unreachable after
     * this loop iteration.
     */
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

    const suggestedStatus =
      safeSuggestedStatus(
        matchedApplication,
        mapCategoryToStatus(
          detection.category,
        ),
      );

    const suggestionId =
      createSuggestionId(
        connection.googleAccountId,
        reference.providerMessageId,
      );

    if (
      suggestions.some(
        (suggestion) =>
          suggestion.id ===
          suggestionId,
      )
    ) {
      continue;
    }

    const suggestion:
      RecruitmentEmailSuggestion = {
        id: suggestionId,

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

        suggestedStatus,

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

  const savedConnection = {
    ...connection,
    lastSyncAt: completedAt,
  };

  const saved =
    await saveGmailConnection(
      savedConnection,
    );

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

  const state =
    await getEmailIntegrationState(
      applyMateUserId,
      connection.googleAccountId,
    );

  return state.suggestions;
}