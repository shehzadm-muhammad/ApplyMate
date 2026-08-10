import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { ApiError } from "../services/apiClient";
import {
  resendVerificationEmail,
  verifyEmail,
} from "../services/authService";
import { colors } from "../theme/colors";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "VerifyEmail"
  >;

function secondsUntil(
  timestamp: string | null | undefined,
): number {
  if (!timestamp) {
    return 0;
  }

  const target = Date.parse(timestamp);

  if (Number.isNaN(target)) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((target - Date.now()) / 1000),
  );
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visible =
    localPart.length > 1
      ? localPart.charAt(0)
      : localPart;

  return `${visible}${"*".repeat(
    Math.max(3, localPart.length - 1),
  )}@${domain}`;
}

export default function VerifyEmailScreen({
  navigation,
  route,
}: Readonly<Props>) {
  const {
    pendingVerification,
    rememberPendingVerification,
    clearPendingVerification,
  } = useAuth();

  const email =
    pendingVerification?.email ??
    route.params?.email ??
    "";

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] =
    useState(false);
  const [isResending, setIsResending] =
    useState(false);
  const [generalError, setGeneralError] =
    useState("");
  const [statusMessage, setStatusMessage] =
    useState("");

  const [remainingSeconds, setRemainingSeconds] =
    useState(() =>
      secondsUntil(
        pendingVerification?.resendAvailableAt,
      ),
    );

  useEffect(() => {
    setRemainingSeconds(
      secondsUntil(
        pendingVerification?.resendAvailableAt,
      ),
    );

    const interval = setInterval(() => {
      setRemainingSeconds(
        secondsUntil(
          pendingVerification?.resendAvailableAt,
        ),
      );
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [pendingVerification?.resendAvailableAt]);

  const normalisedCode =
    code.replace(/\D/g, "").slice(0, 6);

  const isCodeValid =
    /^\d{6}$/.test(normalisedCode);

  const maskedEmail = useMemo(
    () => maskEmail(email),
    [email],
  );

  const handleVerify = async () => {
    if (
      !email ||
      !isCodeValid ||
      isVerifying
    ) {
      return;
    }

    Keyboard.dismiss();
    setGeneralError("");
    setStatusMessage("");
    setIsVerifying(true);

    try {
      await verifyEmail({
        email,
        code: normalisedCode,
      });

      await clearPendingVerification();

      navigation.replace("Login", {
        registeredEmail: email,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setGeneralError(error.message);
      } else {
        setGeneralError(
          "Something went wrong while verifying your email.",
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (
      !email ||
      remainingSeconds > 0 ||
      isResending
    ) {
      return;
    }

    setGeneralError("");
    setStatusMessage("");
    setIsResending(true);

    try {
      const response =
        await resendVerificationEmail({
          email,
        });

      await rememberPendingVerification({
        email,
        verificationExpiresAt:
          response.verificationExpiresAt ??
          pendingVerification
            ?.verificationExpiresAt ??
          null,
        resendAvailableAt:
          response.resendAvailableAt ??
          pendingVerification
            ?.resendAvailableAt ??
          null,
      });

      setStatusMessage(
        "If verification is still required, a new code has been sent.",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.response?.retryAfterSeconds != null
        ) {
          setRemainingSeconds(
            error.response.retryAfterSeconds,
          );
        }

        setGeneralError(error.message);
      } else {
        setGeneralError(
          "Something went wrong while requesting a new code.",
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = async () => {
    await clearPendingVerification();

    navigation.replace("Login", {
      registeredEmail: email || undefined,
    });
  };

  if (!email) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingState}>
          <Text style={styles.heading}>
            Verification unavailable
          </Text>

          <Text style={styles.description}>
            Return to login and enter your email again.
          </Text>

          <View style={styles.buttonSection}>
            <PrimaryButton
              title="Back to Log In"
              onPress={() =>
                navigation.replace("Login")
              }
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 70 : 0
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>
            Verify your email
          </Text>

          <Text style={styles.description}>
            Enter the 6-digit verification code for{" "}
            <Text style={styles.emailText}>
              {maskedEmail}
            </Text>
            . If you haven&apos;t received a code,
            you can request another below.
          </Text>

          <View style={styles.form}>
            <TextField
              label="Verification code"
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="done"
              maxLength={6}
              value={normalisedCode}
              onChangeText={(value) =>
                setCode(
                  value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              onSubmitEditing={handleVerify}
              error={
                code.length > 0 && !isCodeValid
                  ? "Enter the 6-digit code"
                  : undefined
              }
            />
          </View>

          {generalError ? (
            <Text style={styles.generalError}>
              {generalError}
            </Text>
          ) : null}

          {statusMessage ? (
            <Text style={styles.statusMessage}>
              {statusMessage}
            </Text>
          ) : null}

          <View style={styles.buttonSection}>
            <PrimaryButton
              title={
                isVerifying
                  ? "Verifying..."
                  : "Verify Email"
              }
              disabled={
                !isCodeValid || isVerifying
              }
              onPress={handleVerify}
            />
          </View>

          <View style={styles.resendSection}>
            <Text style={styles.resendPrompt}>
              Didn&apos;t receive the code?
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={
                remainingSeconds > 0 ||
                isResending
              }
              onPress={handleResend}
            >
              <Text
                style={[
                  styles.resendLink,
                  remainingSeconds > 0 ||
                  isResending
                    ? styles.resendDisabled
                    : undefined,
                ]}
              >
                {isResending
                  ? "Sending..."
                  : remainingSeconds > 0
                    ? `Resend in ${remainingSeconds}s`
                    : "Resend code"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleBackToLogin}
            style={styles.loginButton}
          >
            <Text style={styles.loginLink}>
              Back to Log In
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 1,
    paddingBottom: 40,
  },

  missingState: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  heading: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 39,
  },

  description: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 25,
  },

  emailText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },

  form: {
    marginTop: 40,
  },

  buttonSection: {
    marginTop: 28,
  },

  resendSection: {
    marginTop: 24,
    alignItems: "center",
    gap: 8,
  },

  resendPrompt: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  resendLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  resendDisabled: {
    color: colors.textSecondary,
  },

  loginButton: {
    alignItems: "center",
    marginTop: 28,
    paddingVertical: 8,
  },

  loginLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  generalError: {
    marginTop: 18,
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },

  statusMessage: {
    marginTop: 18,
    color: colors.success,
    fontSize: 14,
    lineHeight: 20,
  },
});