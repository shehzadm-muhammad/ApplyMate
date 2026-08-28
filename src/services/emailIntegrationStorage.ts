import * as SecureStore from "expo-secure-store";

import type {
  EmailIntegrationState,
  ProcessedGmailMessage,
  RecruitmentEmailSuggestion,
} from "../types/emailIntegration";

const STORAGE_KEY_PREFIX =
  "applymate.gmail.integration.v1.";

const MAX_PROCESSED_MESSAGES = 500;
const MAX_SUGGESTIONS = 75;

const RETENTION_MS =
  180 * 24 * 60 * 60 * 1000;

function getStorageKey(
  applyMateUserId: string,
  googleAccountId: string,
): string {
  return `${STORAGE_KEY_PREFIX}${applyMateUserId}.${googleAccountId}`;
}

function emptyState(): EmailIntegrationState {
  return {
    version: 1,
    processedMessages: [],
    suggestions: [],
  };
}

function pruneProcessedMessages(
  messages: ProcessedGmailMessage[],
): ProcessedGmailMessage[] {
  const cutoff =
    Date.now() - RETENTION_MS;

  return messages
    .filter((message) => {
      const processedAt =
        Date.parse(message.processedAt);

      return (
        !Number.isNaN(processedAt) &&
        processedAt >= cutoff
      );
    })
    .sort(
      (left, right) =>
        Date.parse(right.processedAt) -
        Date.parse(left.processedAt),
    )
    .slice(0, MAX_PROCESSED_MESSAGES);
}

function pruneSuggestions(
  suggestions: RecruitmentEmailSuggestion[],
): RecruitmentEmailSuggestion[] {
  const cutoff =
    Date.now() - RETENTION_MS;

  return suggestions
    .filter((suggestion) => {
      const createdAt =
        Date.parse(suggestion.createdAt);

      return (
        !Number.isNaN(createdAt) &&
        createdAt >= cutoff
      );
    })
    .sort(
      (left, right) =>
        Date.parse(right.createdAt) -
        Date.parse(left.createdAt),
    )
    .slice(0, MAX_SUGGESTIONS);
}

function normalizeState(
  state: EmailIntegrationState,
): EmailIntegrationState {
  return {
    version: 1,
    processedMessages:
      pruneProcessedMessages(
        state.processedMessages,
      ),
    suggestions:
      pruneSuggestions(
        state.suggestions,
      ),
  };
}

export async function getEmailIntegrationState(
  applyMateUserId: string,
  googleAccountId: string,
): Promise<EmailIntegrationState> {
  const key =
    getStorageKey(
      applyMateUserId,
      googleAccountId,
    );

  const stored =
    await SecureStore.getItemAsync(key);

  if (!stored) {
    return emptyState();
  }

  try {
    const parsed =
      JSON.parse(stored) as
        Partial<EmailIntegrationState>;

    if (
      parsed.version !== 1 ||
      !Array.isArray(
        parsed.processedMessages,
      ) ||
      !Array.isArray(
        parsed.suggestions,
      )
    ) {
      await SecureStore.deleteItemAsync(
        key,
      );

      return emptyState();
    }

    return normalizeState({
      version: 1,
      processedMessages:
        parsed.processedMessages,
      suggestions:
        parsed.suggestions,
    });
  } catch {
    await SecureStore.deleteItemAsync(
      key,
    );

    return emptyState();
  }
}

export async function saveEmailIntegrationState(
  applyMateUserId: string,
  googleAccountId: string,
  state: EmailIntegrationState,
): Promise<void> {
  await SecureStore.setItemAsync(
    getStorageKey(
      applyMateUserId,
      googleAccountId,
    ),
    JSON.stringify(
      normalizeState(state),
    ),
  );
}

export async function clearEmailIntegrationState(
  applyMateUserId: string,
  googleAccountId: string,
): Promise<void> {
  await SecureStore.deleteItemAsync(
    getStorageKey(
      applyMateUserId,
      googleAccountId,
    ),
  );
}