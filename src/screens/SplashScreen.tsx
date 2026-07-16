import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootStackParamList } from "../navigation/types";
import { getSession } from "../services/authStorage";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showGetStarted, setShowGetStarted] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasSession = await getSession();

        // Keep the splash visible briefly so it does not flash too quickly.
        await new Promise((resolve) => setTimeout(resolve, 900));

        if (hasSession) {
          navigation.replace("MainApp");
          return;
        }

        setShowGetStarted(true);
      } catch (error) {
        console.error("Unable to check ApplyMate session:", error);
        setShowGetStarted(true);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void checkSession();
  }, [navigation]);

  const handleGetStarted = () => {
    navigation.navigate("Welcome");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandSection}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>AM</Text>
          </View>

          <Text style={styles.appName}>
            <Text style={styles.applyText}>Apply</Text>
            <Text style={styles.mateText}>Mate</Text>
          </Text>

          <Text style={styles.tagline}>
            Apply smarter. Get hired faster.
          </Text>
        </View>

        {isCheckingSession ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
          </View>
        ) : showGetStarted ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get started with ApplyMate"
            onPress={handleGetStarted}
            style={({ pressed }) => [
              styles.button,
              pressed ? styles.buttonPressed : undefined,
            ]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        ) : (
          <View style={styles.bottomPlaceholder} />
        )}
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 155,
    paddingBottom: 32,
  },

  brandSection: {
    alignItems: "center",
  },

  logoPlaceholder: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderRadius: 28,
    backgroundColor: colors.primary,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -2,
  },

  appName: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },

  applyText: {
    color: colors.textPrimary,
  },

  mateText: {
    color: colors.primary,
  },

  tagline: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },

  loadingSection: {
    width: "100%",
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomPlaceholder: {
    minHeight: 56,
  },

  button: {
    width: "100%",
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary,
  },

  buttonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});