import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Welcome back</Text>

        <Text style={styles.description}>
          Log in to continue tracking your applications.
        </Text>
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
});