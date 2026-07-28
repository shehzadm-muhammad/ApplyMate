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
import { registerUser } from "../services/authService";
import { ApiError } from "../services/apiClient";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Readonly<Props>) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedEmail = email.trim();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  const isFormValid =
    trimmedFirstName.length > 0 &&
    trimmedLastName.length > 0 &&
    isEmailValid &&
    isPasswordValid &&
    doPasswordsMatch;

  const markAsTouched = (field: keyof typeof touched) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  };

  const firstNameError =
    touched.firstName && trimmedFirstName.length === 0
      ? "Enter your first name"
      : undefined;

  const lastNameError =
    touched.lastName && trimmedLastName.length === 0
      ? "Enter your last name"
      : undefined;

  const emailError =
    touched.email && !isEmailValid
      ? "Enter a valid email address"
      : undefined;

  const passwordError =
    touched.password && !isPasswordValid
      ? "Password must be at least 8 characters"
      : undefined;

  const confirmPasswordError =
    touched.confirmPassword && !doPasswordsMatch
      ? "Passwords do not match"
      : undefined;

const handleCreateAccount = async () => {
  setTouched({
    firstName: true,
    lastName: true,
    email: true,
    password: true,
    confirmPassword: true,
  });

  setGeneralError("");

  if (!isFormValid || isLoading) {
    return;
  }

  Keyboard.dismiss();
  setIsLoading(true);

  const normalisedEmail = trimmedEmail.toLowerCase();

  try {
    await registerUser({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: normalisedEmail,
      password,
    });

    navigation.replace("Login", {
      registeredEmail: normalisedEmail,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      setGeneralError(error.message);
    } else {
      setGeneralError(
        "Something went wrong while creating your account.",
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
          <Text style={styles.heading}>Create your account</Text>

          <Text style={styles.description}>
            Start organising your job search with ApplyMate.
          </Text>

          <View style={styles.form}>
            <TextField
              label="First name"
              placeholder="Enter your first name"
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              returnKeyType="next"
              value={firstName}
              onChangeText={setFirstName}
              onBlur={() => markAsTouched("firstName")}
              onSubmitEditing={() => lastNameRef.current?.focus()}
              error={firstNameError}
            />

            <TextField
              ref={lastNameRef}
              label="Last name"
              placeholder="Enter your last name"
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              returnKeyType="next"
              value={lastName}
              onChangeText={setLastName}
              onBlur={() => markAsTouched("lastName")}
              onSubmitEditing={() => emailRef.current?.focus()}
              error={lastNameError}
            />

            <TextField
              ref={emailRef}
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
              onBlur={() => markAsTouched("email")}
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={emailError}
            />

            <TextField
              ref={passwordRef}
              label="Password"
              placeholder="Create a password"
              secure
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              value={password}
              onChangeText={setPassword}
              onBlur={() => markAsTouched("password")}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              error={passwordError}
            />

            <TextField
              ref={confirmPasswordRef}
              label="Confirm password"
              placeholder="Enter your password again"
              secure
              returnKeyType="done"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onBlur={() => markAsTouched("confirmPassword")}
              onSubmitEditing={handleCreateAccount}
              error={confirmPasswordError}
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
    isLoading
      ? "Creating Account..."
      : "Create Account"
  }
  disabled={!isFormValid || isLoading}
  onPress={handleCreateAccount}
/>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log in to ApplyMate"
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginLink}>Log In</Text>
            </Pressable>
          </View>

          <Text style={styles.termsText}>
            By creating an account, you agree to our{" "}
            <Text style={styles.linkText}>Terms of Service</Text> and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>.
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

  buttonSection: {
    marginTop: 28,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  loginText: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  loginLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  termsText: {
    marginTop: 20,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  linkText: {
    color: colors.primary,
    fontWeight: "600",
  },

  generalError: {
  marginTop: 18,
  color: "#DC2626",
  fontSize: 14,
  lineHeight: 20,
},

});