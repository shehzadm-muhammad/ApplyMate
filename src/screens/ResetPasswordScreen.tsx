import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import type { RootStackParamList } from "../navigation/types";
import { ApiError } from "../services/apiClient";
import {
  forgotPassword,
  resetPassword,
} from "../services/authService";
import { colors } from "../theme/colors";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "ResetPassword"
  >;

const RESEND_COOLDOWN_MS = 60_000;

export default function ResetPasswordScreen({
  navigation,
  route,
}: Readonly<Props>) {
  const { email } = route.params;

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [touched, setTouched] = useState({
    code: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isResetting, setIsResetting] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const [generalError, setGeneralError] =
    useState("");

  const [statusMessage, setStatusMessage] =
    useState(
      "If an ApplyMate account exists for this email, a reset code has been sent.",
    );

  const [
    resendAvailableAt,
    setResendAvailableAt,
  ] = useState(
    () => Date.now() + RESEND_COOLDOWN_MS,
  );

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(60);

  const newPasswordRef =
    useRef<TextInput>(null);

  const confirmPasswordRef =
    useRef<TextInput>(null);

  useEffect(() => {
    const updateRemainingSeconds = () => {
      setRemainingSeconds(
        Math.max(
          0,
          Math.ceil(
            (resendAvailableAt -
              Date.now()) /
              1000,
          ),
        ),
      );
    };

    updateRemainingSeconds();

    const interval =
      setInterval(
        updateRemainingSeconds,
        1000,
      );

    return () => {
      clearInterval(interval);
    };
  }, [resendAvailableAt]);

  const normalisedCode =
    code
      .replace(/\D/g, "")
      .slice(0, 6);

  const isCodeValid =
    /^\d{6}$/.test(normalisedCode);

  const isPasswordValid =
    newPassword.length >= 8 &&
    newPassword.length <= 72;

  const doPasswordsMatch =
    confirmPassword.length > 0 &&
    confirmPassword === newPassword;

  const isFormValid =
    isCodeValid &&
    isPasswordValid &&
    doPasswordsMatch;

  const codeError =
    touched.code && !isCodeValid
      ? "Enter the 6-digit code"
      : undefined;

  const passwordError =
    touched.newPassword &&
    !isPasswordValid
      ? "Password must be between 8 and 72 characters"
      : undefined;

  const confirmPasswordError =
    touched.confirmPassword &&
    !doPasswordsMatch
      ? "Passwords do not match"
      : undefined;

  const handleReset = async () => {
    setTouched({
      code: true,
      newPassword: true,
      confirmPassword: true,
    });

    setGeneralError("");
    setStatusMessage("");

    if (!isFormValid || isResetting) {
      return;
    }

    Keyboard.dismiss();
    setIsResetting(true);

    try {
      await resetPassword({
        email,
        code: normalisedCode,
        newPassword,
      });

      setCode("");
      setNewPassword("");
      setConfirmPassword("");

      navigation.replace("Login", {
        registeredEmail: email,
        passwordReset: true,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (
          error.response?.code ===
          "PASSWORD_RESET_CODE_INVALID_OR_EXPIRED"
        ) {
          setGeneralError(
            "That reset code is invalid or has expired. Request a new code and try again.",
          );
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError(
          "Something went wrong while resetting your password.",
        );
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleResend = async () => {
    if (
      remainingSeconds > 0 ||
      isResending
    ) {
      return;
    }

    setGeneralError("");
    setStatusMessage("");
    setIsResending(true);

    try {
      await forgotPassword({
        email,
      });

      setCode("");

      setResendAvailableAt(
        Date.now() +
          RESEND_COOLDOWN_MS,
      );

      setStatusMessage(
        "If an ApplyMate account exists for this email, a new reset code has been sent.",
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setGeneralError(error.message);
      } else {
        setGeneralError(
          "Something went wrong while requesting another code.",
        );
      }
    } finally {
      setIsResending(false);
    }
  };

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
          Platform.OS === "ios"
            ? 70
            : 0
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
            Reset your password
          </Text>

          <Text style={styles.description}>
            Enter the 6-digit reset code
            and choose a new password.
          </Text>

          <Text style={styles.emailText}>
            {email}
          </Text>

          <View style={styles.form}>
            <TextField
              label="Reset code"
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="next"
              maxLength={6}
              value={normalisedCode}
              onChangeText={(value) =>
                setCode(
                  value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  code: true,
                }))
              }
              onSubmitEditing={() =>
                newPasswordRef.current?.focus()
              }
              error={codeError}
            />

            <TextField
              ref={newPasswordRef}
              label="New password"
              placeholder="Enter a new password"
              secure
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              value={newPassword}
              onChangeText={setNewPassword}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  newPassword: true,
                }))
              }
              onSubmitEditing={() =>
                confirmPasswordRef.current?.focus()
              }
              error={passwordError}
            />

            <TextField
              ref={confirmPasswordRef}
              label="Confirm password"
              placeholder="Confirm your new password"
              secure
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  confirmPassword: true,
                }))
              }
              onSubmitEditing={handleReset}
              error={
                confirmPasswordError
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
                isResetting
                  ? "Resetting..."
                  : "Reset Password"
              }
              disabled={
                !isFormValid ||
                isResetting
              }
              onPress={handleReset}
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
    marginTop: 8,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },

  form: {
    marginTop: 32,
    gap: 20,
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