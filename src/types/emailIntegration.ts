import type { ApplicationStatus } from "../services/applicationService";

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

export type RecruitmentEmailCategory =
  | "APPLICATION_RECEIVED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTION"
  | "FOLLOW_UP"
  | "UNKNOWN";

export type EmailConfidence =
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type EmailSuggestionState =
  | "PENDING"
  | "CONFIRMED"
  | "IGNORED";

export interface GmailMessageReference {
  providerMessageId: string;
  providerThreadId: string;
}

export interface GmailMessageMetadata {
  providerMessageId: string;
  providerThreadId: string;
  receivedAt: string;
  sender: string;
  subject: string;
  snippet: string;
}

export interface RecruitmentEmailDetection {
  category: RecruitmentEmailCategory;
  confidence: EmailConfidence;
  score: number;
  reason: string;
  requiresBody: boolean;
}

export interface ApplicationMatch {
  applicationId: string | null;
  confidence: EmailConfidence;
  score: number;
  reason: string;
}

export interface RecruitmentEmailSuggestion {
  id: string;

  applyMateUserId: string;
  googleAccountId: string;

  providerMessageId: string;
  providerThreadId: string;

  receivedAt: string;

  detectedType: RecruitmentEmailCategory;
  detectionConfidence: EmailConfidence;

  matchedApplicationId: string | null;
  matchConfidence: EmailConfidence;

  suggestedStatus: ApplicationStatus | null;

  detectionReason: string;
  matchReason: string;

  emailSubject: string;
  senderDisplay: string;

  state: EmailSuggestionState;
  createdAt: string;
}

export interface ProcessedGmailMessage {
  providerMessageId: string;
  processedAt: string;
}

export interface EmailIntegrationState {
  version: 1;
  processedMessages: ProcessedGmailMessage[];
  suggestions: RecruitmentEmailSuggestion[];
}

export interface EmailSyncResult {
  candidateIdsFound: number;
  alreadyProcessed: number;
  metadataFetched: number;
  bodiesFetched: number;
  suggestionsCreated: number;
  completedAt: string;
}