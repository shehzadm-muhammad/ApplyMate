import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { colors } from "../theme/colors";

export default function RegisterScreen() {
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
          />

          <TextField
            label="Last name"
            placeholder="Enter your last name"
            autoCapitalize="words"
          />

          <TextField
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextField
            label="Password"
            placeholder="Create a password"
            secure
          />
          <TextField
            label="Confirm password"
            placeholder="Enter your password again"
            secure
          />
          <View style={styles.buttonSection}></View>
          <PrimaryButton
            title="Create Account"
            onPress={() => console.log("Create Account pressed")}
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