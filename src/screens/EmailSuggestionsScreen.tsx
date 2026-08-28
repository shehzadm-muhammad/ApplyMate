import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  useFocusEffect,
} from "@react-navigation/native";

import type {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";

import type {
  RootStackParamList,
} from "../navigation/types";

import {
  getApplications,
  type JobApplication,
} from "../services/applicationService";

import {
  confirmRecruitmentEmailSuggestion,
  EmailSuggestionActionError,
  getRecruitmentEmailSuggestions,
  ignoreRecruitmentEmailSuggestion,
} from "../services/emailIntegrationService";

import {
  deriveApplicationPrefillFromSuggestion,
  resolveRecruitmentEmailSuggestion,
} from "../services/emailSuggestionResolver";

import type {
  RecruitmentEmailSuggestion,
} from "../types/emailIntegration";

import { colors } from "../theme/colors";

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    "EmailSuggestions"
  >;

function categoryLabel(
  category:
    RecruitmentEmailSuggestion["detectedType"],
): string {
  switch (category) {
    case "APPLICATION_RECEIVED":
      return "Application received";
    case "ASSESSMENT":
      return "Assessment";
    case "INTERVIEW":
      return "Interview";
    case "OFFER":
      return "Offer";
    case "REJECTION":
      return "Rejection";
    case "FOLLOW_UP":
      return "Follow-up";
    case "UNKNOWN":
      return "Possible update";
  }
}

function formatReceivedAt(
  value: string,
): string {
  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? ""
    : date.toLocaleString();
}

export default function EmailSuggestionsScreen({
  navigation,
  route,
}: Props) {
  const { user } = useAuth();

  const [
    suggestions,
    setSuggestions,
  ] = useState<
    RecruitmentEmailSuggestion[]
  >([]);

  const [
    applications,
    setApplications,
  ] = useState<
    JobApplication[]
  >([]);

  const [
    selectedApplications,
    setSelectedApplications,
  ] = useState<
    Record<string, string>
  >({});

  const [loading, setLoading] =
    useState(true);

  const [
    actionBusyId,
    setActionBusyId,
  ] = useState<
    string | null
  >(null);

  const [
    pickerSuggestionId,
    setPickerSuggestionId,
  ] = useState<
    string | null
  >(null);

  const loadData =
    useCallback(async () => {
      if (!user) {
        setSuggestions([]);
        setApplications([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [
          storedSuggestions,
          storedApplications,
        ] = await Promise.all([
          getRecruitmentEmailSuggestions(
            user.id,
          ),
          getApplications(),
        ]);

        setSuggestions(
          storedSuggestions.filter(
            (suggestion) =>
              suggestion.state ===
              "PENDING",
          ),
        );

        setApplications(
          storedApplications,
        );
      } catch {
        Alert.alert(
          "Couldn't load email updates",
          "ApplyMate couldn't load your email suggestions right now.",
        );
      } finally {
        setLoading(false);
      }
    }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      const returnedSuggestionId =
        route.params
          ?.suggestionId;

      const returnedApplicationId =
        route.params
          ?.selectedApplicationId;

      if (
        returnedSuggestionId &&
        returnedApplicationId
      ) {
        setSelectedApplications(
          (current) => ({
            ...current,
            [returnedSuggestionId]:
              returnedApplicationId,
          }),
        );

        navigation.setParams({
          suggestionId:
            undefined,
          selectedApplicationId:
            undefined,
        });
      }

      void loadData();
    }, [
      loadData,
      navigation,
      route.params
        ?.suggestionId,
      route.params
        ?.selectedApplicationId,
    ]),
  );

  const activePickerSuggestion =
    useMemo(
      () =>
        suggestions.find(
          (suggestion) =>
            suggestion.id ===
            pickerSuggestionId,
        ) ?? null,
      [
        pickerSuggestionId,
        suggestions,
      ],
    );

  const selectedApplicationFor =
    (
      suggestion:
        RecruitmentEmailSuggestion,
    ) => {
      const selectedId =
        selectedApplications[
          suggestion.id
        ] ??
        suggestion
          .matchedApplicationId;

      return applications.find(
        (application) =>
          application.id ===
          selectedId,
      );
    };

  const chooseApplication =
    (
      suggestionId: string,
      applicationId: string,
    ) => {
      setSelectedApplications(
        (current) => ({
          ...current,
          [suggestionId]:
            applicationId,
        }),
      );

      setPickerSuggestionId(
        null,
      );
    };

  const createApplication =
    (
      suggestion:
        RecruitmentEmailSuggestion,
    ) => {
      const prefill =
        deriveApplicationPrefillFromSuggestion(
          suggestion,
        );

      setPickerSuggestionId(
        null,
      );

      navigation.navigate(
        "MainApp",
        {
          screen:
            "AddApplication",
          params: {
            sourceEmailSuggestionId:
              suggestion.id,
            initialCompany:
              prefill.company ||
              undefined,
            initialJobTitle:
              prefill.jobTitle ||
              undefined,
            initialStatus:
              prefill.status,
          },
        },
      );
    };

  const performIgnore =
    async (
      suggestion:
        RecruitmentEmailSuggestion,
    ) => {
      if (
        !user ||
        actionBusyId
      ) {
        return;
      }

      setActionBusyId(
        suggestion.id,
      );

      try {
        await ignoreRecruitmentEmailSuggestion(
          user.id,
          suggestion.id,
        );

        await loadData();
      } catch {
        Alert.alert(
          "Couldn't ignore update",
          "The suggestion could not be updated. Please try again.",
        );
      } finally {
        setActionBusyId(
          null,
        );
      }
    };

  const performConfirm =
    async (
      suggestion:
        RecruitmentEmailSuggestion,
    ) => {
      if (
        !user ||
        actionBusyId
      ) {
        return;
      }

      const application =
        selectedApplicationFor(
          suggestion,
        );

      if (!application) {
        Alert.alert(
          "Choose an application",
          "Choose an existing application or create a new one first.",
        );

        return;
      }

      setActionBusyId(
        suggestion.id,
      );

      try {
        const result =
          await confirmRecruitmentEmailSuggestion(
            user.id,
            suggestion.id,
            application.id,
          );

        Alert.alert(
          result.applicationUpdated
            ? "Application updated"
            : "Email handled",
          result.applicationUpdated
            ? `Application status changed to ${result.status}.`
            : `The application was already marked ${result.status}. No status change was needed.`,
        );

        await loadData();
      } catch (error) {
        if (
          error instanceof
            EmailSuggestionActionError
        ) {
          Alert.alert(
            "Couldn't apply update",
            error.message,
          );

          await loadData();
          return;
        }

        Alert.alert(
          "Couldn't apply update",
          "Your application was not changed. Please try again.",
        );
      } finally {
        setActionBusyId(
          null,
        );
      }
    };

  if (loading) {
    return (
      <View
        style={styles.loading}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={styles.heading}
        >
          Email updates
        </Text>

        <Text
          style={styles.intro}
        >
          Review recruitment emails
          before ApplyMate changes any
          application.
        </Text>

        <Text
          style={styles.countText}
        >
          {suggestions.length} pending{" "}
          {suggestions.length === 1
            ? "suggestion"
            : "suggestions"}
        </Text>

        {suggestions.length ===
        0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyTitle}
            >
              You're all caught up
            </Text>

            <Text
              style={styles.emptyText}
            >
              There are no useful email
              updates waiting for review.
            </Text>
          </View>
        ) : null}

        {suggestions.map(
          (suggestion) => {
            const application =
              selectedApplicationFor(
                suggestion,
              );

            const resolution =
              resolveRecruitmentEmailSuggestion(
                suggestion,
                application,
              );

            const busy =
              actionBusyId ===
              suggestion.id;

            const canConfirm =
              Boolean(
                application &&
                  resolution.canConfirm,
              );

            return (
              <View
                key={suggestion.id}
                style={
                  styles.suggestionCard
                }
              >
                <View
                  style={
                    styles.categoryRow
                  }
                >
                  <Text
                    style={
                      styles.category
                    }
                  >
                    {categoryLabel(
                      suggestion.detectedType,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.confidence
                    }
                  >
                    {
                      suggestion.detectionConfidence
                    }
                  </Text>
                </View>

                <Text
                  style={styles.subject}
                >
                  {suggestion.emailSubject ||
                    "No subject"}
                </Text>

                <Text
                  style={styles.sender}
                >
                  {
                    suggestion.senderDisplay
                  }
                </Text>

                <Text
                  style={styles.date}
                >
                  {formatReceivedAt(
                    suggestion.receivedAt,
                  )}
                </Text>

                <View
                  style={styles.divider}
                />

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  Application
                </Text>

                {application ? (
                  <>
                    <Text
                      style={
                        styles.applicationTitle
                      }
                    >
                      {
                        application.jobTitle
                      }
                    </Text>

                    <Text
                      style={
                        styles.applicationCompany
                      }
                    >
                      {
                        application.company
                      }
                    </Text>

                    <Text
                      style={
                        styles.statusLine
                      }
                    >
                      Current:{" "}
                      {
                        application.status
                      }
                      {resolution.targetStatus
                        ? `  →  Email: ${resolution.targetStatus}`
                        : ""}
                    </Text>
                  </>
                ) : (
                  <Text
                    style={
                      styles.noMatch
                    }
                  >
                    No confident application
                    match was found.
                  </Text>
                )}

                <Text
                  style={[
                    styles.resolutionText,
                    resolution.kind ===
                      "STALE"
                      ? styles.staleText
                      : undefined,
                  ]}
                >
                  {
                    resolution.reason
                  }
                </Text>

                {application ? (
                  <Pressable
                    style={
                      styles.secondaryButton
                    }
                    disabled={busy}
                    onPress={() =>
                      setPickerSuggestionId(
                        suggestion.id,
                      )
                    }
                  >
                    <Text
                      style={
                        styles.secondaryButtonText
                      }
                    >
                      Change application
                    </Text>
                  </Pressable>
                ) : (
                  <View
                    style={
                      styles.matchActions
                    }
                  >
                    <Pressable
                      style={
                        styles.secondaryButton
                      }
                      disabled={busy}
                      onPress={() =>
                        setPickerSuggestionId(
                          suggestion.id,
                        )
                      }
                    >
                      <Text
                        style={
                          styles.secondaryButtonText
                        }
                      >
                        Choose existing
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.createButton
                      }
                      disabled={busy}
                      onPress={() =>
                        createApplication(
                          suggestion,
                        )
                      }
                    >
                      <Text
                        style={
                          styles.createButtonText
                        }
                      >
                        Create application
                      </Text>
                    </Pressable>
                  </View>
                )}

                <Text
                  style={
                    styles.reasonText
                  }
                >
                  {
                    suggestion.detectionReason
                  }
                </Text>

                <View
                  style={
                    styles.actionRow
                  }
                >
                  <Pressable
                    style={
                      styles.ignoreButton
                    }
                    disabled={busy}
                    onPress={() => {
                      Alert.alert(
                        "Ignore this email update?",
                        "ApplyMate will leave your application unchanged and hide this suggestion.",
                        [
                          {
                            text: "Cancel",
                            style: "cancel",
                          },
                          {
                            text: "Ignore",
                            style:
                              "destructive",
                            onPress:
                              () => {
                                void performIgnore(
                                  suggestion,
                                );
                              },
                          },
                        ],
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.ignoreButtonText
                      }
                    >
                      Ignore
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.confirmButton,
                      (!canConfirm ||
                        busy) &&
                        styles.disabledButton,
                    ]}
                    disabled={
                      !canConfirm ||
                      busy
                    }
                    onPress={() => {
                      void performConfirm(
                        suggestion,
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.confirmButtonText
                      }
                    >
                      {busy
                        ? "Working..."
                        : resolution.kind ===
                            "NO_CHANGE"
                          ? "Mark handled"
                          : "Confirm"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          },
        )}
      </ScrollView>

      <Modal
        visible={
          activePickerSuggestion !==
          null
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPickerSuggestionId(
            null,
          )
        }
      >
        <View
          style={
            styles.modalBackdrop
          }
        >
          <View
            style={styles.modalCard}
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Choose application
            </Text>

            <Text
              style={
                styles.modalDescription
              }
            >
              Select an existing
              application or create a new
              one from this email.
            </Text>

            {activePickerSuggestion ? (
              <Pressable
                style={
                  styles.createFromModal
                }
                onPress={() =>
                  createApplication(
                    activePickerSuggestion,
                  )
                }
              >
                <Text
                  style={
                    styles.createFromModalText
                  }
                >
                  + Create new application
                </Text>
              </Pressable>
            ) : null}

            <ScrollView
              style={
                styles.applicationList
              }
            >
              {applications.map(
                (application) => (
                  <Pressable
                    key={
                      application.id
                    }
                    style={
                      styles.applicationOption
                    }
                    onPress={() => {
                      if (
                        activePickerSuggestion
                      ) {
                        chooseApplication(
                          activePickerSuggestion.id,
                          application.id,
                        );
                      }
                    }}
                  >
                    <Text
                      style={
                        styles.optionTitle
                      }
                    >
                      {
                        application.jobTitle
                      }
                    </Text>

                    <Text
                      style={
                        styles.optionCompany
                      }
                    >
                      {
                        application.company
                      }
                    </Text>

                    <Text
                      style={
                        styles.optionStatus
                      }
                    >
                      {
                        application.status
                      }
                    </Text>
                  </Pressable>
                ),
              )}
            </ScrollView>

            <Pressable
              style={
                styles.modalCancel
              }
              onPress={() =>
                setPickerSuggestionId(
                  null,
                )
              }
            >
              <Text
                style={
                  styles.modalCancelText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.background,
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 80,
    },

    heading: {
      color: colors.textPrimary,
      fontSize: 30,
      fontWeight: "800",
    },

    intro: {
      marginTop: 8,
      color:
        colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },

    countText: {
      marginTop: 18,
      marginBottom: 12,
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },

    suggestionCard: {
      marginBottom: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor:
        colors.surface,
    },

    categoryRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    category: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "800",
    },

    confidence: {
      color:
        colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
    },

    subject: {
      marginTop: 12,
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: "700",
    },

    sender: {
      marginTop: 5,
      color:
        colors.textSecondary,
      fontSize: 13,
    },

    date: {
      marginTop: 4,
      color:
        colors.textSecondary,
      fontSize: 12,
    },

    divider: {
      height: 1,
      marginVertical: 16,
      backgroundColor:
        colors.border,
    },

    fieldLabel: {
      color:
        colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      textTransform:
        "uppercase",
    },

    applicationTitle: {
      marginTop: 7,
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },

    applicationCompany: {
      marginTop: 3,
      color:
        colors.textSecondary,
      fontSize: 14,
    },

    statusLine: {
      marginTop: 8,
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },

    noMatch: {
      marginTop: 7,
      color:
        colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },

    resolutionText: {
      marginTop: 12,
      color:
        colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "600",
    },

    staleText: {
      color: "#8A4B08",
    },

    matchActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 12,
    },

    secondaryButton: {
      alignSelf: "flex-start",
      marginTop: 12,
      paddingVertical: 9,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor:
        colors.primary,
      borderRadius: 10,
    },

    secondaryButtonText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
    },

    createButton: {
      alignSelf: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 13,
      borderRadius: 10,
      backgroundColor:
        colors.primary,
    },

    createButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },

    reasonText: {
      marginTop: 14,
      color:
        colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },

    actionRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 18,
    },

    ignoreButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 12,
    },

    ignoreButtonText: {
      color: colors.textPrimary,
      fontWeight: "700",
    },

    confirmButton: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor:
        colors.primary,
    },

    confirmButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
    },

    disabledButton: {
      opacity: 0.45,
    },

    emptyCard: {
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor:
        colors.surface,
    },

    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 19,
      fontWeight: "800",
    },

    emptyText: {
      marginTop: 7,
      color:
        colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },

    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor:
        "rgba(0,0,0,0.35)",
    },

    modalCard: {
      maxHeight: "78%",
      padding: 22,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor:
        colors.background,
    },

    modalTitle: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
    },

    modalDescription: {
      marginTop: 6,
      color:
        colors.textSecondary,
      fontSize: 14,
    },

    createFromModal: {
      marginTop: 16,
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor:
        colors.primary,
    },

    createFromModalText: {
      color: "#FFFFFF",
      fontWeight: "800",
      textAlign: "center",
    },

    applicationList: {
      marginTop: 10,
    },

    applicationOption: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    optionTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
    },

    optionCompany: {
      marginTop: 3,
      color:
        colors.textSecondary,
      fontSize: 13,
    },

    optionStatus: {
      marginTop: 4,
      color: colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },

    modalCancel: {
      alignItems: "center",
      marginTop: 14,
      paddingVertical: 13,
    },

    modalCancelText: {
      color: colors.primary,
      fontWeight: "800",
    },
  });