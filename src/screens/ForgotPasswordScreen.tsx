import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import type { RootStackParamList } from "../navigation/types";
import { ApiError } from "../services/apiClient";
import { forgotPassword } from "../services/authService";
import { colors } from "../theme/colors";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "ForgotPassword"
  >;

export default function ForgotPasswordScreen({
  navigation,
  route,
}: Readonly<Props>) {
  const [email, setEmail] = useState(
    route.params?.email ?? "",
  );

  const [touched, setTouched] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [generalError, setGeneralError] =
    useState("");

  const trimmedEmail = email.trim();

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      trimmedEmail,
    );

  const emailError =
    touched && !isEmailValid
      ? "Enter a valid email address"
      : undefined;

  const handleSendCode = async () => {
    setTouched(true);
    setGeneralError("");

    if (!isEmailValid || isSubmitting) {
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    const normalisedEmail =
      trimmedEmail.toLowerCase();

    try {
      await forgotPassword({
        email: normalisedEmail,
      });

      navigation.replace(
        "ResetPassword",
        {
          email: normalisedEmail,
        },
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setGeneralError(error.message);
      } else {
        setGeneralError(
          "Something went wrong while requesting a reset code.",
        );
      }
    } finally {
      setIsSubmitting(false);
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
            Forgot password?
          </Text>

          <Text style={styles.description}>
            Enter the email address for your
            ApplyMate account. If an account
            exists, we&apos;ll send you a
            6-digit reset code.
          </Text>

          <View style={styles.form}>
            <TextField
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="done"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched(true)}
              onSubmitEditing={handleSendCode}
              error={emailError}
            />
          </View>

          {generalError ? (
            <Text style={styles.generalError}>
              {generalError}
            </Text>
          ) : null}

          <View style={styles.buttonSection}>
            <PrimaryButton
              title={
                isSubmitting
                  ? "Sending..."
                  : "Send Code"
              }
              disabled={
                !isEmailValid ||
                isSubmitting
              }
              onPress={handleSendCode}
            />
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

  form: {
    marginTop: 40,
  },

  buttonSection: {
    marginTop: 28,
  },

  generalError: {
    marginTop: 18,
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});