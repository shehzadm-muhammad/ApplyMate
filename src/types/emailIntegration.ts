export interface GmailConnection {
  provider: "GMAIL";
  applyMateUserId: string;
  googleAccountId: string;
  googleEmail: string;
  connectedAt: string;
  lastSyncAt: string | null;
}

export interface GmailDisconnectResult {
  providerRevocationConfirmed: boolean;
}