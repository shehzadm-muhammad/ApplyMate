import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
  type OneTapSuccessData,
} from "react-native-nitro-google-signin";

import {
  clearEmailIntegrationState,
} from "./emailIntegrationStorage";

import type {
  GmailConnection,
  GmailDisconnectResult,
} from "../types/emailIntegration";

import {
  getGmailConnection,
  getGmailConnectionOwner,
  removeGmailConnection,
  saveGmailConnection,
} from "./gmailConnectionStorage";

const GOOGLE_WEB_CLIENT_ID =
  "780981050021-h0ev6qpqndcftpc3eh6tj6f5otkcu6cf.apps.googleusercontent.com";

export const GMAIL_READONLY_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

export type GmailAuthorizationErrorCode =
  | "CANCELLED"
  | "AUTHORIZATION_FAILED"
  | "REAUTH_REQUIRED"
  | "ACCOUNT_ALREADY_CONNECTED";

export class GmailAuthorizationError extends Error {
  constructor(
    public readonly code:
      GmailAuthorizationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GmailAuthorizationError";
  }
}

let googleConfigured = false;

function ensureGoogleConfigured(): void {
  if (googleConfigured) {
    return;
  }

  GoogleOneTapSignIn.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    autoSelectOnSignIn: false,
  });

  googleConfigured = true;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function googleAccountMatchesConnection(
  googleUser: OneTapSuccessData,
  connection: GmailConnection,
): boolean {
  if (
    googleUser.user.id ===
    connection.googleAccountId
  ) {
    return true;
  }

  const currentEmail =
    googleUser.user.email
      ? normalizeEmail(
          googleUser.user.email,
        )
      : null;

  return (
    currentEmail !== null &&
    currentEmail ===
      normalizeEmail(
        connection.googleEmail,
      )
  );
}

function isGoogleCancellation(
  error: unknown,
): boolean {
  return (
    isErrorWithCode(error) &&
    error.code ===
      statusCodes.SIGN_IN_CANCELLED
  );
}

async function assertGoogleAccountAvailable(
  applyMateUserId: string,
  googleUser: OneTapSuccessData,
): Promise<void> {
  const email = googleUser.user.email;

  if (!email) {
    throw new GmailAuthorizationError(
      "AUTHORIZATION_FAILED",
      "The selected Google account has no usable email address.",
    );
  }

  const owner =
    await getGmailConnectionOwner(
      googleUser.user.id,
      normalizeEmail(email),
    );

  if (
    owner &&
    owner !== applyMateUserId
  ) {
    throw new GmailAuthorizationError(
      "ACCOUNT_ALREADY_CONNECTED",
      "This Gmail account is already connected to another ApplyMate account on this device.",
    );
  }
}

async function selectGoogleAccount(): Promise<OneTapSuccessData> {
  let response =
    await GoogleOneTapSignIn.createAccount();

  if (
    isNoSavedCredentialFoundResponse(
      response,
    )
  ) {
    response =
      await GoogleOneTapSignIn.presentExplicitSignIn();
  }

  if (isCancelledResponse(response)) {
    throw new GmailAuthorizationError(
      "CANCELLED",
      "Google account selection was cancelled.",
    );
  }

  if (!isSuccessResponse(response)) {
    throw new GmailAuthorizationError(
      "AUTHORIZATION_FAILED",
      "Google account selection did not complete.",
    );
  }

  return response.data;
}

async function restoreMatchingGoogleSession(
  connection: GmailConnection,
): Promise<OneTapSuccessData | null> {
  ensureGoogleConfigured();

  let current =
    GoogleOneTapSignIn.getCurrentUser();

  if (
    current &&
    googleAccountMatchesConnection(
      current,
      connection,
    )
  ) {
    return current;
  }

  if (current) {
    await clearGmailNativeSession();
  }

  try {
    const response =
      await GoogleOneTapSignIn.signIn();

    if (
      isSuccessResponse(response) &&
      googleAccountMatchesConnection(
        response.data,
        connection,
      )
    ) {
      return response.data;
    }
  } catch {
    /*
     * A failed silent restore simply means the
     * user must reconnect Gmail.
     */
  }

  await clearGmailNativeSession();

  return null;
}

export async function clearGmailNativeSession(): Promise<void> {
  ensureGoogleConfigured();

  try {
    await GoogleOneTapSignIn.signOut();
  } catch {
    /*
     * Google session cleanup must never prevent
     * normal ApplyMate authentication/logout.
     */
  }
}

export async function connectGmail(
  applyMateUserId: string,
): Promise<GmailConnection> {
  ensureGoogleConfigured();

  try {
    await GoogleOneTapSignIn.checkPlayServices();

    /*
     * Never silently inherit a native Google
     * session belonging to a previous
     * ApplyMate user.
     */
    await clearGmailNativeSession();

    const selectedGoogleUser =
      await selectGoogleAccount();

    const beforeAuthorization =
      GoogleOneTapSignIn.getCurrentUser();

    if (
      !beforeAuthorization ||
      beforeAuthorization.user.id !==
        selectedGoogleUser.user.id
    ) {
      throw new GmailAuthorizationError(
        "AUTHORIZATION_FAILED",
        "Google account state changed unexpectedly.",
      );
    }

    /*
     * Block the same Gmail account from being
     * associated with two ApplyMate accounts on
     * this device before requesting Gmail scope.
     */
    await assertGoogleAccountAvailable(
      applyMateUserId,
      selectedGoogleUser,
    );

    const authorization =
      await GoogleOneTapSignIn.requestScopes([
        GMAIL_READONLY_SCOPE,
      ]);

    /*
     * The access token is intentionally not
     * stored. Merely confirm that device
     * authorization succeeded.
     */
    if (!authorization.accessToken) {
      throw new GmailAuthorizationError(
        "AUTHORIZATION_FAILED",
        "Gmail access was not granted.",
      );
    }

    const authorizedGoogleUser =
      GoogleOneTapSignIn.getCurrentUser();

    if (
      !authorizedGoogleUser ||
      authorizedGoogleUser.user.id !==
        selectedGoogleUser.user.id ||
      !authorizedGoogleUser.scopes.includes(
        GMAIL_READONLY_SCOPE,
      )
    ) {
      throw new GmailAuthorizationError(
        "AUTHORIZATION_FAILED",
        "Gmail permission could not be confirmed.",
      );
    }

    const email =
      authorizedGoogleUser.user.email;

    if (!email) {
      throw new GmailAuthorizationError(
        "AUTHORIZATION_FAILED",
        "The selected Google account has no usable email address.",
      );
    }

    /*
     * Re-check ownership after authorization as
     * a final guard before persisting state.
     */
    await assertGoogleAccountAvailable(
      applyMateUserId,
      authorizedGoogleUser,
    );

    const connection: GmailConnection = {
      provider: "GMAIL",
      applyMateUserId,
      googleAccountId:
        authorizedGoogleUser.user.id,
      googleEmail: normalizeEmail(email),
      connectedAt:
        new Date().toISOString(),
      lastSyncAt: null,
    };

    const saved =
      await saveGmailConnection(
        connection,
      );

    if (!saved) {
      throw new GmailAuthorizationError(
        "ACCOUNT_ALREADY_CONNECTED",
        "This Gmail account is already connected to another ApplyMate account on this device.",
      );
    }

    return connection;
  } catch (error) {
    await clearGmailNativeSession();

    if (
      error instanceof
        GmailAuthorizationError
    ) {
      throw error;
    }

    if (isGoogleCancellation(error)) {
      throw new GmailAuthorizationError(
        "CANCELLED",
        "Google authorization was cancelled.",
      );
    }

    throw new GmailAuthorizationError(
      "AUTHORIZATION_FAILED",
      "Gmail could not be connected.",
    );
  }
}

export async function getAuthorizedGmailAccessToken(
  applyMateUserId: string,
): Promise<string> {
  ensureGoogleConfigured();

  const connection =
    await getGmailConnection(
      applyMateUserId,
    );

  if (!connection) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "Gmail is not connected for this ApplyMate account.",
    );
  }

  const owner =
    await getGmailConnectionOwner(
      connection.googleAccountId,
      connection.googleEmail,
    );

  if (owner !== applyMateUserId) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "This Gmail connection is not owned by the current ApplyMate account.",
    );
  }

  const googleUser =
    await restoreMatchingGoogleSession(
      connection,
    );

  if (!googleUser) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "Gmail needs to be reconnected.",
    );
  }

  let current =
    GoogleOneTapSignIn.getCurrentUser();

  if (
    !current ||
    !googleAccountMatchesConnection(
      current,
      connection,
    )
  ) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "The active Google account does not match this ApplyMate account.",
    );
  }

  /*
   * Request Gmail permission only when the
   * currently restored Google session does not
   * already report the approved scope.
   */
  if (
    !current.scopes.includes(
      GMAIL_READONLY_SCOPE,
    )
  ) {
    await GoogleOneTapSignIn.requestScopes([
      GMAIL_READONLY_SCOPE,
    ]);

    current =
      GoogleOneTapSignIn.getCurrentUser();

    if (
      !current ||
      !googleAccountMatchesConnection(
        current,
        connection,
      ) ||
      !current.scopes.includes(
        GMAIL_READONLY_SCOPE,
      )
    ) {
      throw new GmailAuthorizationError(
        "REAUTH_REQUIRED",
        "Gmail authorization could not be confirmed.",
      );
    }
  }

  /*
   * getTokens() is the library's normal API for
   * retrieving the currently authorised access
   * token used for Google API requests.
   */
  const { accessToken } =
    await GoogleOneTapSignIn.getTokens();

  if (!accessToken) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "A Gmail access token could not be obtained.",
    );
  }

  /*
   * The token remains transient and is never
   * persisted or logged.
   */
  return accessToken;
}

export async function refreshAuthorizedGmailAccessToken(
  applyMateUserId: string,
  staleAccessToken: string,
): Promise<string> {
  ensureGoogleConfigured();

  const connection =
    await getGmailConnection(
      applyMateUserId,
    );

  if (!connection) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "Gmail is not connected for this ApplyMate account.",
    );
  }

  const owner =
    await getGmailConnectionOwner(
      connection.googleAccountId,
      connection.googleEmail,
    );

  if (owner !== applyMateUserId) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "This Gmail connection is not owned by the current ApplyMate account.",
    );
  }

  const googleUser =
    await restoreMatchingGoogleSession(
      connection,
    );

  if (
    !googleUser ||
    !googleUser.scopes.includes(
      GMAIL_READONLY_SCOPE,
    )
  ) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "Gmail needs to be reconnected.",
    );
  }

  const current =
    GoogleOneTapSignIn.getCurrentUser();

  if (
    !current ||
    !googleAccountMatchesConnection(
      current,
      connection,
    )
  ) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "The active Google account does not match this ApplyMate account.",
    );
  }

  try {
    await GoogleOneTapSignIn.clearCachedAccessToken(
      staleAccessToken,
    );
  } catch {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "The expired Gmail authorization could not be refreshed.",
    );
  }

  const { accessToken } =
    await GoogleOneTapSignIn.getTokens();

  if (!accessToken) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "A fresh Gmail access token could not be obtained.",
    );
  }

  const refreshedUser =
    GoogleOneTapSignIn.getCurrentUser();

  if (
    !refreshedUser ||
    !googleAccountMatchesConnection(
      refreshedUser,
      connection,
    ) ||
    !refreshedUser.scopes.includes(
      GMAIL_READONLY_SCOPE,
    )
  ) {
    throw new GmailAuthorizationError(
      "REAUTH_REQUIRED",
      "The refreshed Gmail authorization could not be confirmed.",
    );
  }

  return accessToken;
}

export async function disconnectGmail(
  applyMateUserId: string,
): Promise<GmailDisconnectResult> {
  ensureGoogleConfigured();

  const connection =
    await getGmailConnection(
      applyMateUserId,
    );

  if (!connection) {
    await removeGmailConnection(
      applyMateUserId,
    );

    await clearGmailNativeSession();

    return {
      providerRevocationConfirmed: true,
    };
  }

  let providerRevocationConfirmed =
    false;

  try {
    const owner =
      await getGmailConnectionOwner(
        connection.googleAccountId,
        connection.googleEmail,
      );

    if (
      owner !== applyMateUserId
    ) {
      return {
        providerRevocationConfirmed:
          false,
      };
    }

    const matchingGoogleUser =
      await restoreMatchingGoogleSession(
        connection,
      );

    /*
     * Never call revokeAccess unless the
     * current Google account and the local
     * ownership registry both match this
     * ApplyMate user.
     */
    if (matchingGoogleUser) {
      try {
        await GoogleOneTapSignIn.revokeAccess(
          connection.googleAccountId,
        );

        providerRevocationConfirmed =
          true;
      } catch {
        providerRevocationConfirmed =
          false;
      }
    }
  } finally {
    await clearEmailIntegrationState(
      applyMateUserId,
      connection.googleAccountId,
    );

    await removeGmailConnection(
      applyMateUserId,
    );

    await clearGmailNativeSession();
  }

  return {
    providerRevocationConfirmed,
  };
}

export async function disconnectGmailAfterAccountDeletion(
  applyMateUserId: string,
): Promise<void> {
  try {
    await disconnectGmail(
      applyMateUserId,
    );
  } catch {
    /*
     * An already-completed ApplyMate account
     * deletion must not be rolled back by a
     * provider failure.
     */
    try {
      await removeGmailConnection(
        applyMateUserId,
      );
    } catch {
      // Nothing more can safely be done locally.
    }

    await clearGmailNativeSession();
  }
}