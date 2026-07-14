import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import StatCard from "../components/StatCard";
import type { MainTabParamList } from "../navigation/mainTabTypes";
import {
  getApplications,
  type JobApplication,
} from "../services/applicationStorage";
import {
  getStoredUser,
  type StoredUser,
} from "../services/authStorage";
import { colors } from "../theme/colors";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;
export default function DashboardScreen({ navigation }: Props) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  useFocusEffect(
    useCallback(() => {
      const loadDashboardData = async () => {
        const [storedUser, storedApplications] = await Promise.all([
          getStoredUser(),
          getApplications(),
        ]);

        setUser(storedUser);
        setApplications(storedApplications);
      };

      void loadDashboardData();
    }, [])
  );

  const totalApplications = applications.length;

  const interviewCount = applications.filter(
    (application) => application.status === "Interview"
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "Offer"
  ).length;

const submittedApplications = applications.filter(
  (application) => application.status !== "Saved"
);

const respondedApplications = submittedApplications.filter((application) =>
  ["Assessment", "Interview", "Offer", "Rejected"].includes(
    application.status
  )
).length;

const responseRate =
  submittedApplications.length === 0
    ? 0
    : Math.round(
        (respondedApplications / submittedApplications.length) * 100
      );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>{greeting},</Text>

        <Text style={styles.name}>
          {user?.firstName ?? "Job seeker"} 👋
        </Text>

        <Text style={styles.sectionTitle}>Your progress</Text>

        <View style={styles.statsGrid}>
          <StatCard title="Applications" value={totalApplications} />
          <StatCard title="Interviews" value={interviewCount} />
          <StatCard title="Offers" value={offerCount} />
          <StatCard title="Response rate" value={`${responseRate}%`} />
        </View>

        {applications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No applications yet</Text>

            <Text style={styles.emptyDescription}>
              Add your first application and start tracking your job search.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("AddApplication")}
              style={({ pressed }) => [
                styles.addButton,
                pressed ? styles.addButtonPressed : undefined,
              ]}
            >
              <Text style={styles.addButtonText}>Add Application</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent applications</Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate("Applications")}
              >
                <Text style={styles.viewAllText}>View all</Text>
              </Pressable>
            </View>

            {applications.slice(0, 3).map((application) => (
  <Pressable
    key={application.id}
    accessibilityRole="button"
    onPress={() =>
      navigation.navigate("ApplicationDetails", {
        applicationId: application.id,
      })
    }
    style={({ pressed }) => [
      styles.applicationCard,
      pressed ? styles.cardPressed : undefined,
    ]}
  >
    <View style={styles.applicationContent}>
      <Text style={styles.companyName}>
        {application.company}
      </Text>

      <Text style={styles.jobTitle}>
        {application.jobTitle}
      </Text>
    </View>

    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>
        {application.status}
      </Text>
    </View>
  </Pressable>
))}

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("AddApplication")}
              style={({ pressed }) => [
                styles.secondaryAddButton,
                pressed ? styles.addButtonPressed : undefined,
              ]}
            >
              <Text style={styles.secondaryAddButtonText}>
                Add another application
              </Text>
            </Pressable>
          </View>
        )}
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
    paddingTop: 20,
    paddingBottom: 120,
  },

  greeting: {
    color: colors.textSecondary,
    fontSize: 17,
  },

  name: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  sectionTitle: {
    marginTop: 36,
    marginBottom: 16,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  emptyCard: {
    marginTop: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  emptyDescription: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },

  addButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },

  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  recentSection: {
    marginTop: 32,
  },

  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  recentTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  applicationCard: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  applicationContent: {
    flex: 1,
    paddingRight: 12,
  },

  companyName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  jobTitle: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  secondaryAddButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  secondaryAddButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  cardPressed: {
  opacity: 0.85,
  transform: [{ scale: 0.99 }],
  },
});