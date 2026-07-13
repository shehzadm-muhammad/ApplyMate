import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { colors } from "../theme/colors";
import {useState} from "react";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });    
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

  const isFormValid =
      trimmedFirstName.length > 0 &&
      trimmedLastName.length > 0 &&
      isEmailValid &&
      isPasswordValid &&
      doPasswordsMatch;    
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Create your account</Text>

        <Text style={styles.description}>
          Start organising your job search with ApplyMate.
        </Text>

        <View style={styles.form}>
          <TextField
            label="First name"
            placeholder="Enter your first name"
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
            onBlur={() => markAsTouched("firstName")}
            error={firstNameError}
          />

          <TextField
            label="Last name"
            placeholder="Enter your last name"
            autoCapitalize="words"
            value={lastName}
            onChangeText={setLastName}
            onBlur={() => markAsTouched("lastName")}
            error={lastNameError}
          />

          <TextField
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onBlur={() => markAsTouched("email")}
            error={emailError}
          />

          <TextField
            label="Password"
            placeholder="Create a password"
            secure
            value={password}
            onChangeText={setPassword}
            onBlur={() => markAsTouched("password")}
            error={passwordError}
          />
          <TextField
            label="Confirm password"
            placeholder="Enter your password again"
            secure
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => markAsTouched("confirmPassword")}
            error={confirmPasswordError}
          />
          <View style={styles.buttonSection}></View>
          <PrimaryButton
            title="Create Account"
            disabled={!isFormValid}
            onPress={() => {
              console.log({
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
              });
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
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
});