import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import type { RootStackParamList } from "../navigation/types";
import {
  deleteApplication,
  getApplicationById,
  type JobApplication,
} from "../services/applicationStorage";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ApplicationDetails"
>;

type DetailRowProps = Readonly<{
  label: string;
  value: string;
}>;

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function ApplicationDetailsScreen({
  navigation,
  route,
}: Props) {
  const [application, setApplication] =
    useState<JobApplication | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadApplication = async () => {
        setIsLoading(true);

        const storedApplication = await getApplicationById(
          route.params.applicationId
        );

        setApplication(storedApplication);
        setIsLoading(false);
      };

      void loadApplication();
    }, [route.params.applicationId])
  );

  const handleOpenLink = async () => {
    if (!application?.jobUrl) {
      return;
    }

    const canOpen = await Linking.canOpenURL(application.jobUrl);

    if (!canOpen) {
      Alert.alert(
        "Unable to open link",
        "This job link does not appear to be valid."
      );

      return;
    }

    await Linking.openURL(application.jobUrl);
  };

  const performDelete = async () => {
    if (!application || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteApplication(application.id);
      navigation.goBack();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete application?",
      `This will permanently delete your ${application?.company ?? ""} application.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void performDelete();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Loading application...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.messageContainer}>
          <Text style={styles.notFoundTitle}>
            Application not found
          </Text>

          <Text style={styles.messageText}>
            This application may have been deleted.
          </Text>

          <View style={styles.backButtonSection}>
            <PrimaryButton
              title="Go Back"
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const createdDate = new Date(
    application.createdAt
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {application.company}
          </Text>

          <Text style={styles.jobTitle}>
            {application.jobTitle}
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {application.status}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            Application details
          </Text>

          {application.location ? (
            <DetailRow
              label="Location"
              value={application.location}
            />
          ) : null}

          {application.salary ? (
            <DetailRow
              label="Salary"
              value={application.salary}
            />
          ) : null}

          <DetailRow
            label="Status"
            value={application.status}
          />

          <DetailRow
            label="Added"
            value={createdDate}
          />
        </View>

        {application.jobUrl ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job link</Text>

            <Pressable
              accessibilityRole="link"
              onPress={handleOpenLink}
              style={({ pressed }) => [
                styles.linkCard,
                pressed ? styles.pressed : undefined,
              ]}
            >
              <Text
                style={styles.linkText}
                numberOfLines={2}
              >
                {application.jobUrl}
              </Text>

              <Text style={styles.openLinkText}>Open ↗</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>

          <View style={styles.notesCard}>
            <Text style={styles.notesText}>
              {application.notes ||
                "No notes have been added yet."}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Edit Application"
            onPress={() =>
              console.log("Edit application:", application.id)
            }
          />

          <Pressable
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && !isDeleting
                ? styles.pressed
                : undefined,
            ]}
          >
            <Text style={styles.deleteButtonText}>
              {isDeleting
                ? "Deleting..."
                : "Delete Application"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 60,
  },

  header: {
    alignItems: "flex-start",
  },

  companyName: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  jobTitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 26,
  },

  statusBadge: {
    marginTop: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  statusText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  detailsCard: {
    marginTop: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "700",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 20,
  },

  detailLabel: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  detailValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },

  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  linkText: {
    flex: 1,
    paddingRight: 14,
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
  },

  openLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  notesCard: {
    minHeight: 110,
    marginTop: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  notesText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },

  actions: {
    gap: 12,
    marginTop: 34,
  },

  deleteButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  deleteButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },

  messageContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  notFoundTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },

  messageText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },

  backButtonSection: {
    marginTop: 28,
  },
});