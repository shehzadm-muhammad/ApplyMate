import { useState } from "react";
import {
  StyleSheet,
  Text,
} from "react-native";
import type {
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import {
  SafeAreaView,
} from "react-native-safe-area-context";

import ApplicationForm from "../components/ApplicationForm";

import type {
  MainTabParamList,
} from "../navigation/mainTabTypes";

import type {
  RootStackParamList,
} from "../navigation/types";

import {
  importJobPreview,
  saveApplication,
  type ApplicationFormValues,
} from "../services/applicationService";

import { colors } from "../theme/colors";

type Props =
  BottomTabScreenProps<
    MainTabParamList,
    "AddApplication"
  >;

export default function AddApplicationScreen({
  navigation,
  route,
}: Readonly<Props>) {
  const [formKey, setFormKey] =
    useState(0);

  const sourceSuggestionId =
    route.params
      ?.sourceEmailSuggestionId;

  const initialValues:
    ApplicationFormValues = {
      jobUrl: "",
      company:
        route.params
          ?.initialCompany ?? "",
      jobTitle:
        route.params
          ?.initialJobTitle ?? "",
      location: "",
      salary: "",
      status:
        route.params
          ?.initialStatus ??
        "Applied",
      notes: "",
      jobDescription: "",
      requiredSkills: "",
      benefits: "",
      recruiter: "",
      applicationDeadline: "",
    };

  const clearEmailParams = () => {
    navigation.setParams({
      sourceEmailSuggestionId:
        undefined,
      initialCompany: undefined,
      initialJobTitle: undefined,
      initialStatus: undefined,
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <Text style={styles.heading}>
        Add application
      </Text>

      <Text
        style={styles.description}
      >
        {sourceSuggestionId
          ? "Review the details detected from the recruitment email, complete anything missing, and save the application."
          : "Paste a job link or enter the details manually."}
      </Text>

      <ApplicationForm
        key={`${formKey}:${
          sourceSuggestionId ??
          "manual"
        }`}
        initialValues={
          initialValues
        }
        submitLabel={
          sourceSuggestionId
            ? "Save and Review Email"
            : "Save Application"
        }
        onImportJob={
          importJobPreview
        }
        onSubmit={async (
          values,
        ) => {
          try {
            const created =
              await saveApplication(
                values,
              );

            if (
              sourceSuggestionId
            ) {
              const parent =
                navigation.getParent<
                  NativeStackNavigationProp<
                    RootStackParamList
                  >
                >();

              clearEmailParams();

              if (parent) {
                parent.navigate(
                  "EmailSuggestions",
                  {
                    suggestionId:
                      sourceSuggestionId,
                    selectedApplicationId:
                      created.id,
                  },
                );

                return;
              }
            }

            setFormKey(
              (current) =>
                current + 1,
            );

            navigation.navigate(
              "Home",
            );
          } catch (error) {
            console.error(
              "Unable to save application:",
              error,
            );

            throw error;
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    heading: {
      marginHorizontal: 24,
      marginTop: 12,
      color:
        colors.textPrimary,
      fontSize: 32,
      fontWeight: "800",
    },

    description: {
      marginHorizontal: 24,
      marginTop: 10,
      marginBottom: 28,
      color:
        colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
    },
  });