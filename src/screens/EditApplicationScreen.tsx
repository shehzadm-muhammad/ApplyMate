import { useCallback, useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import ApplicationForm, {
  type ApplicationFormValues,
} from "../components/ApplicationForm";
import type { RootStackParamList } from "../navigation/types";
import {
  getApplicationById,
  updateApplication,
} from "../services/applicationService";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "EditApplication"
>;

export default function EditApplicationScreen({
  navigation,
  route,
}: Readonly<Props>) {
  const [initialValues, setInitialValues] =
    useState<ApplicationFormValues | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadApplication = async () => {
        const application = await getApplicationById(
          route.params.applicationId
        );

        if (!application) {
          navigation.goBack();
          return;
        }

        setInitialValues({
            jobUrl: application.jobUrl,
  company: application.company,
  jobTitle: application.jobTitle,
  location: application.location,
  salary: application.salary,
  status: application.status,
  notes: application.notes,

  jobDescription: application.jobDescription,
  requiredSkills: application.requiredSkills,
  benefits: application.benefits,
  recruiter: application.recruiter,
  applicationDeadline: application.applicationDeadline,
        });
      };

      void loadApplication();
    }, [navigation, route.params.applicationId])
  );

  if (!initialValues) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.loading}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.heading}>
        Edit application
      </Text>

      <Text style={styles.description}>
        Update any information about this application.
      </Text>

      <ApplicationForm
        initialValues={initialValues}
        submitLabel="Save Changes"
        onSubmit={async (values) => {
  try {
    await updateApplication(
      route.params.applicationId,
      values
    );

    navigation.goBack();
  } catch (error) {
    console.error(
      "Unable to update application:",
      error
    );
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
    marginTop: 8,
    marginBottom: 20,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },

  loading: {
    flex: 1,
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: colors.textSecondary,
  },
});