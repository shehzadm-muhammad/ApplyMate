export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  code: string | null;
  message: string;
  path: string;
  fieldErrors: Record<string, string>;
  retryAfterSeconds: number | null;
}

export interface ApiStatusResponse {
  name: string;
  version: string;
  status: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;

  verificationRequired: boolean;
  verificationExpiresAt: string;
  resendAvailableAt: string;
  verificationEmailSent: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface EmailVerificationResponse {
  verified: boolean;
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  verificationExpiresAt: string | null;
  resendAvailableAt: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  createdAt: string;
}