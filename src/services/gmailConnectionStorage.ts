import * as SecureStore from "expo-secure-store";

import type { GmailConnection } from "../types/emailIntegration";

const GMAIL_CONNECTION_KEY_PREFIX =
  "applymate.gmail.connection.v1.";

const GMAIL_OWNERSHIP_REGISTRY_KEY =
  "applymate.gmail.ownership.v1";

type GmailConnectionOwnership = Readonly<{
  applyMateUserId: string;
  googleAccountId: string;
  googleEmail: string;
}>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getConnectionStorageKey(
  applyMateUserId: string,
): string {
  const userId = applyMateUserId.trim();

  if (
    !userId ||
    !/^[A-Za-z0-9._-]+$/.test(userId)
  ) {
    throw new Error(
      "Unsupported ApplyMate user identifier.",
    );
  }

  return `${GMAIL_CONNECTION_KEY_PREFIX}${userId}`;
}

function isGmailConnection(
  value: unknown,
): value is GmailConnection {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<GmailConnection>;

  return (
    candidate.provider === "GMAIL" &&
    typeof candidate.applyMateUserId === "string" &&
    typeof candidate.googleAccountId === "string" &&
    typeof candidate.googleEmail === "string" &&
    typeof candidate.connectedAt === "string" &&
    (
      typeof candidate.lastSyncAt === "string" ||
      candidate.lastSyncAt === null
    )
  );
}

function isGmailConnectionOwnership(
  value: unknown,
): value is GmailConnectionOwnership {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<GmailConnectionOwnership>;

  return (
    typeof candidate.applyMateUserId === "string" &&
    typeof candidate.googleAccountId === "string" &&
    typeof candidate.googleEmail === "string"
  );
}

async function readOwnershipRegistry(): Promise<
  GmailConnectionOwnership[]
> {
  const stored =
    await SecureStore.getItemAsync(
      GMAIL_OWNERSHIP_REGISTRY_KEY,
    );

  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        isGmailConnectionOwnership,
      )
    ) {
      await SecureStore.deleteItemAsync(
        GMAIL_OWNERSHIP_REGISTRY_KEY,
      );

      return [];
    }

    return parsed;
  } catch {
    await SecureStore.deleteItemAsync(
      GMAIL_OWNERSHIP_REGISTRY_KEY,
    );

    return [];
  }
}

async function writeOwnershipRegistry(
  ownerships: GmailConnectionOwnership[],
): Promise<void> {
  if (ownerships.length === 0) {
    await SecureStore.deleteItemAsync(
      GMAIL_OWNERSHIP_REGISTRY_KEY,
    );

    return;
  }

  await SecureStore.setItemAsync(
    GMAIL_OWNERSHIP_REGISTRY_KEY,
    JSON.stringify(ownerships),
  );
}

function findOwnership(
  ownerships: GmailConnectionOwnership[],
  googleAccountId: string,
  googleEmail: string,
): GmailConnectionOwnership | null {
  const normalizedEmail =
    normalizeEmail(googleEmail);

  return (
    ownerships.find(
      (ownership) =>
        ownership.googleAccountId ===
          googleAccountId ||
        normalizeEmail(
          ownership.googleEmail,
        ) === normalizedEmail,
    ) ?? null
  );
}

export async function getGmailConnectionOwner(
  googleAccountId: string,
  googleEmail: string,
): Promise<string | null> {
  const ownerships =
    await readOwnershipRegistry();

  return (
    findOwnership(
      ownerships,
      googleAccountId,
      googleEmail,
    )?.applyMateUserId ?? null
  );
}

async function claimGmailConnectionOwnership(
  connection: GmailConnection,
): Promise<boolean> {
  const ownerships =
    await readOwnershipRegistry();

  const existingOwnership =
    findOwnership(
      ownerships,
      connection.googleAccountId,
      connection.googleEmail,
    );

  if (
    existingOwnership &&
    existingOwnership.applyMateUserId !==
      connection.applyMateUserId
  ) {
    return false;
  }

  /*
   * One Gmail connection per ApplyMate account.
   * Remove stale ownership belonging to this
   * ApplyMate user before writing the current one.
   */
  const nextOwnerships =
    ownerships.filter(
      (ownership) =>
        ownership.applyMateUserId !==
          connection.applyMateUserId &&
        ownership.googleAccountId !==
          connection.googleAccountId &&
        normalizeEmail(
          ownership.googleEmail,
        ) !==
          normalizeEmail(
            connection.googleEmail,
          ),
    );

  nextOwnerships.push({
    applyMateUserId:
      connection.applyMateUserId,
    googleAccountId:
      connection.googleAccountId,
    googleEmail: normalizeEmail(
      connection.googleEmail,
    ),
  });

  await writeOwnershipRegistry(
    nextOwnerships,
  );

  return true;
}

export async function getGmailConnection(
  applyMateUserId: string,
): Promise<GmailConnection | null> {
  const key = getConnectionStorageKey(
    applyMateUserId,
  );

  const stored =
    await SecureStore.getItemAsync(key);

  if (!stored) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(stored);

    if (
      !isGmailConnection(parsed) ||
      parsed.applyMateUserId !==
        applyMateUserId
    ) {
      await SecureStore.deleteItemAsync(key);
      return null;
    }

    /*
     * Lazily register connections created before
     * the ownership registry was introduced.
     */
    const ownershipClaimed =
      await claimGmailConnectionOwnership(
        parsed,
      );

    if (!ownershipClaimed) {
      /*
       * Fail closed if inconsistent local state says
       * the Gmail account belongs to another
       * ApplyMate account.
       */
      await SecureStore.deleteItemAsync(key);
      return null;
    }

    return parsed;
  } catch {
    await SecureStore.deleteItemAsync(key);
    return null;
  }
}

export async function saveGmailConnection(
  connection: GmailConnection,
): Promise<boolean> {
  const ownershipClaimed =
    await claimGmailConnectionOwnership(
      connection,
    );

  if (!ownershipClaimed) {
    return false;
  }

  const key = getConnectionStorageKey(
    connection.applyMateUserId,
  );

  /*
   * Ownership is claimed first so a storage failure
   * fails closed rather than allowing another
   * ApplyMate account to claim the same Gmail.
   */
  await SecureStore.setItemAsync(
    key,
    JSON.stringify(connection),
  );

  return true;
}

export async function removeGmailConnection(
  applyMateUserId: string,
): Promise<void> {
  await SecureStore.deleteItemAsync(
    getConnectionStorageKey(
      applyMateUserId,
    ),
  );

  const ownerships =
    await readOwnershipRegistry();

  const nextOwnerships =
    ownerships.filter(
      (ownership) =>
        ownership.applyMateUserId !==
        applyMateUserId,
    );

  await writeOwnershipRegistry(
    nextOwnerships,
  );
}