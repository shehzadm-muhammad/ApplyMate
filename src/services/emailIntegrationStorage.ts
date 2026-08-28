import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import type {
  EmailIntegrationState,
  ProcessedGmailMessage,
  RecruitmentEmailSuggestion,
} from "../types/emailIntegration";

const STORAGE_KEY_PREFIX =
  "@applymate/gmail-integration/v1/";

const LEGACY_SECURESTORE_KEY_PREFIX =
  "applymate.gmail.integration.v1.";

const MAX_PROCESSED_MESSAGES = 500;
const MAX_SUGGESTIONS = 75;

const RETENTION_MS =
  180 * 24 * 60 * 60 * 1000;

function getStorageKey(
  applyMateUserId: string,
  googleAccountId: string,
): string {
  return `${STORAGE_KEY_PREFIX}${applyMateUserId}/${googleAccountId}`;
}

function getLegacyStorageKey(
  applyMateUserId: string,
  googleAccountId: string,
): string {
  return `${LEGACY_SECURESTORE_KEY_PREFIX}${applyMateUserId}.${googleAccountId}`;
}

function emptyState(): EmailIntegrationState {
  return {
    version: 1,
    processedMessages: [],
    suggestions: [],
  };
}

function isProcessedMessage(
  value: unknown,
): value is ProcessedGmailMessage {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<ProcessedGmailMessage>;

  return (
    typeof candidate.providerMessageId ===
      "string" &&
    typeof candidate.processedAt ===
      "string"
  );
}

function isSuggestion(
  value: unknown,
): value is RecruitmentEmailSuggestion {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<RecruitmentEmailSuggestion>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.applyMateUserId ===
      "string" &&
    typeof candidate.googleAccountId ===
      "string" &&
    typeof candidate.providerMessageId ===
      "string" &&
    typeof candidate.providerThreadId ===
      "string" &&
    typeof candidate.receivedAt === "string" &&
    typeof candidate.detectedType ===
      "string" &&
    typeof candidate.detectionConfidence ===
      "string" &&
    (
      typeof candidate.matchedApplicationId ===
        "string" ||
      candidate.matchedApplicationId === null
    ) &&
    typeof candidate.matchConfidence ===
      "string" &&
    (
      typeof candidate.suggestedStatus ===
        "string" ||
      candidate.suggestedStatus === null
    ) &&
    typeof candidate.detectionReason ===
      "string" &&
    typeof candidate.matchReason === "string" &&
    typeof candidate.emailSubject === "string" &&
    typeof candidate.senderDisplay === "string" &&
    (
      candidate.state === "PENDING" ||
      candidate.state === "CONFIRMED" ||
      candidate.state === "IGNORED"
    ) &&
    typeof candidate.createdAt === "string"
  );
}

function parseState(
  stored: string,
): EmailIntegrationState | null {
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
      ) ||
      !parsed.processedMessages.every(
        isProcessedMessage,
      ) ||
      !parsed.suggestions.every(
        isSuggestion,
      )
    ) {
      return null;
    }

    return {
      version: 1,
      processedMessages:
        parsed.processedMessages,
      suggestions:
        parsed.suggestions,
    };
  } catch {
    return null;
  }
}

function pruneProcessedMessages(
  messages: ProcessedGmailMessage[],
): ProcessedGmailMessage[] {
  const cutoff =
    Date.now() - RETENTION_MS;

  const deduplicated =
    new Map<
      string,
      ProcessedGmailMessage
    >();

  for (const message of messages) {
    const processedAt =
      Date.parse(
        message.processedAt,
      );

    if (
      Number.isNaN(processedAt) ||
      processedAt < cutoff
    ) {
      continue;
    }

    const existing =
      deduplicated.get(
        message.providerMessageId,
      );

    if (
      !existing ||
      Date.parse(
        existing.processedAt,
      ) < processedAt
    ) {
      deduplicated.set(
        message.providerMessageId,
        message,
      );
    }
  }

  return [
    ...deduplicated.values(),
  ]
    .sort(
      (left, right) =>
        Date.parse(right.processedAt) -
        Date.parse(left.processedAt),
    )
    .slice(
      0,
      MAX_PROCESSED_MESSAGES,
    );
}

function pruneSuggestions(
  suggestions:
    RecruitmentEmailSuggestion[],
): RecruitmentEmailSuggestion[] {
  const cutoff =
    Date.now() - RETENTION_MS;

  const deduplicated =
    new Map<
      string,
      RecruitmentEmailSuggestion
    >();

  for (
    const suggestion of suggestions
  ) {
    const createdAt =
      Date.parse(
        suggestion.createdAt,
      );

    if (
      Number.isNaN(createdAt) ||
      createdAt < cutoff
    ) {
      continue;
    }

    const existing =
      deduplicated.get(
        suggestion.id,
      );

    if (
      !existing ||
      Date.parse(
        existing.createdAt,
      ) < createdAt
    ) {
      deduplicated.set(
        suggestion.id,
        suggestion,
      );
    }
  }

  return [
    ...deduplicated.values(),
  ]
    .sort(
      (left, right) =>
        Date.parse(right.createdAt) -
        Date.parse(left.createdAt),
    )
    .slice(
      0,
      MAX_SUGGESTIONS,
    );
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

async function migrateLegacyState(
  applyMateUserId: string,
  googleAccountId: string,
): Promise<EmailIntegrationState | null> {
  const legacyKey =
    getLegacyStorageKey(
      applyMateUserId,
      googleAccountId,
    );

  const legacyStored =
    await SecureStore.getItemAsync(
      legacyKey,
    );

  if (!legacyStored) {
    return null;
  }

  const parsed =
    parseState(legacyStored);

  if (!parsed) {
    await SecureStore.deleteItemAsync(
      legacyKey,
    );

    return null;
  }

  const normalized =
    normalizeState(parsed);

  /*
   * Write the new copy first.
   * Delete the legacy SecureStore value only
   * after AsyncStorage succeeds.
   */
  await AsyncStorage.setItem(
    getStorageKey(
      applyMateUserId,
      googleAccountId,
    ),
    JSON.stringify(normalized),
  );

  await SecureStore.deleteItemAsync(
    legacyKey,
  );

  return normalized;
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
    await AsyncStorage.getItem(key);

  if (stored) {
    const parsed =
      parseState(stored);

    if (!parsed) {
      await AsyncStorage.removeItem(
        key,
      );

      return emptyState();
    }

    const normalized =
      normalizeState(parsed);

    /*
     * Persist pruning/deduplication so storage
     * remains bounded between reads.
     */
    await AsyncStorage.setItem(
      key,
      JSON.stringify(normalized),
    );

    return normalized;
  }

  const migrated =
    await migrateLegacyState(
      applyMateUserId,
      googleAccountId,
    );

  return migrated ?? emptyState();
}

export async function saveEmailIntegrationState(
  applyMateUserId: string,
  googleAccountId: string,
  state: EmailIntegrationState,
): Promise<void> {
  const normalized =
    normalizeState(state);

  await AsyncStorage.setItem(
    getStorageKey(
      applyMateUserId,
      googleAccountId,
    ),
    JSON.stringify(normalized),
  );

  /*
   * Remove any pre-migration SecureStore copy.
   * Gmail credentials are not stored here.
   */
  await SecureStore.deleteItemAsync(
    getLegacyStorageKey(
      applyMateUserId,
      googleAccountId,
    ),
  );
}

export async function clearEmailIntegrationState(
  applyMateUserId: string,
  googleAccountId: string,
): Promise<void> {
  /*
   * Best-effort cleanup of both current and
   * legacy locations. Disconnect/account deletion
   * must not leave an old Gmail-processing copy.
   */
  await Promise.allSettled([
    AsyncStorage.removeItem(
      getStorageKey(
        applyMateUserId,
        googleAccountId,
      ),
    ),

    SecureStore.deleteItemAsync(
      getLegacyStorageKey(
        applyMateUserId,
        googleAccountId,
      ),
    ),
  ]);
}