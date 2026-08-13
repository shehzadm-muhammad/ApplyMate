import { useRef, useState } from "react";
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
import { colors } from "../theme/colors";

import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/apiClient";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({
  navigation,
  route,
}: Readonly<Props>) {
const [email, setEmail] = useState(
  route.params?.registeredEmail ?? "",
);  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const [generalError, setGeneralError] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [
  statusMessage,
  setStatusMessage,
] = useState(
  route.params?.passwordReset
    ? "Password changed successfully. You can now log in with your new password."
    : "",
);

  const passwordRef = useRef<TextInput>(null);

  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = password.length >= 8;
  const isFormValid = isEmailValid && isPasswordValid;

  const emailError =
    touched.email && !isEmailValid
      ? "Enter a valid email address"
      : undefined;

  const passwordError =
    touched.password && !isPasswordValid
      ? "Password must be at least 8 characters"
      : undefined;

  const handleLogin = async () => {
  setTouched({
    email: true,
    password: true,
  });

  setGeneralError("");
  setStatusMessage("");

  if (!isFormValid || isLoading) {
    return;
  }

  Keyboard.dismiss();
  setIsLoading(true);

  try {
    await signIn({
      email: trimmedEmail.toLowerCase(),
      password,
    });

    // AuthContext updates the user.
    // RootNavigator automatically displays MainApp.
  } catch (error) {
  if (error instanceof ApiError) {
    if (
      error.response?.code ===
      "EMAIL_VERIFICATION_REQUIRED"
    ) {
      navigation.replace("VerifyEmail", {
        email: trimmedEmail.toLowerCase(),
      });

      return;
    }

    setGeneralError(error.message);
  } else {
      setGeneralError(
        "Something went wrong while logging in.",
      );
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Welcome back</Text>

          <Text style={styles.description}>
            Log in to continue tracking your applications.
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
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  email: true,
                }))
              }
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={emailError}
            />

            <TextField
              ref={passwordRef}
              label="Password"
              placeholder="Enter your password"
              secure
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="done"
              value={password}
              onChangeText={setPassword}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  password: true,
                }))
              }
              onSubmitEditing={handleLogin}
              error={passwordError}
            />
          </View>

          <View style={styles.optionsRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              onPress={() => setRememberMe((current) => !current)}
              style={styles.rememberButton}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe ? styles.checkboxSelected : undefined,
                ]}
              >
                {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>

              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate(
                  "ForgotPassword",
                  {
                    email:
                      trimmedEmail || undefined,
                  },
                )
              }
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </Pressable>
          </View>

          {statusMessage ? (
            <Text style={styles.statusMessage}>
              {statusMessage}
            </Text>
          ) : null}

          {generalError ? (
            <Text style={styles.generalError}>
              {generalError}
            </Text>
          ) : null}

          <View style={styles.buttonSection}>
            <PrimaryButton
              title={isLoading ? "Logging In..." : "Log In"}
              disabled={!isFormValid || isLoading}
              onPress={handleLogin}
            />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>
              Don&apos;t have an account?{" "}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerLink}>Create Account</Text>
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              console.log("Apple Sign-In will be connected later")
            }
            style={({ pressed }) => [
              styles.appleButton,
              pressed ? styles.appleButtonPressed : undefined,
            ]}
          >
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </Pressable>

          <Text style={styles.faceIdNote}>
            Face ID login will become available after your first successful
            login.
          </Text>
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
    gap: 20,
  },

  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },

  rememberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  checkbox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.background,
  },

  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  rememberText: {
    color: colors.textPrimary,
    fontSize: 14,
  },

  forgotPassword: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  buttonSection: {
    marginTop: 28,
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  registerText: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  registerLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    marginHorizontal: 14,
    color: colors.textSecondary,
    fontSize: 14,
  },

  appleButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.textPrimary,
  },

  appleButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  appleButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  faceIdNote: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  generalError: {
  marginTop: 18,
  color: "#DC2626",
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