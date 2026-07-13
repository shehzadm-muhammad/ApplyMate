import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Readonly<Props>) {
  const handleCreateAccount = () => {
    navigation.navigate("Register");
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text style={styles.heading}>Welcome to ApplyMate</Text>

          <Text style={styles.description}>
            Keep every application, interview and follow-up organised in one
            place.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create an ApplyMate account"
            onPress={handleCreateAccount}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log in to ApplyMate"
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </Pressable>
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
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },

  heading: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 43,
  },

  description: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 25,
  },

  actions: {
    gap: 12,
  },

  primaryButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
});