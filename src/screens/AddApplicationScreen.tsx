import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

import ApplicationForm from "../components/ApplicationForm";
import type { MainTabParamList } from "../navigation/mainTabTypes";
import { importJobPreview, saveApplication } from "../services/applicationService";
import { colors } from "../theme/colors";

type Props = BottomTabScreenProps<
  MainTabParamList,
  "AddApplication"
>;

export default function AddApplicationScreen({
  navigation,
}: Readonly<Props>) {
  const [formKey, setFormKey] = useState(0);
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>Add application</Text>

      <Text style={styles.description}>
        Paste a job link or enter the details manually.
      </Text>

      <ApplicationForm
        key={formKey}
        submitLabel="Save Application"
        onImportJob={importJobPreview}
        onSubmit={async (values) => {
  try {
    await saveApplication(values);
    setFormKey((current) => current + 1);
    navigation.navigate("Home");
  } catch (error) {
    console.error("Unable to save application:", error);
    throw error;
  }
}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  heading: {
    marginHorizontal: 24,
    marginTop: 12,
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  description: {
    marginHorizontal: 24,
    marginTop: 10,
    marginBottom: 28,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
});