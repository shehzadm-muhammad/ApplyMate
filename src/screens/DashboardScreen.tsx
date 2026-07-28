import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
  getApplicationSummary,
  getApplications,
  type ApplicationSummary,
  type JobApplication,
} from "../services/applicationService";
import { ApiError } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import ApplicationCard from "../components/ApplicationCard";

const EMPTY_APPLICATION_SUMMARY: ApplicationSummary = {
  total: 0,
  saved: 0,
  applied: 0,
  assessment: 0,
  interview: 0,
  offer: 0,
  rejected: 0,
};

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;
export default function DashboardScreen({ navigation }: Readonly<Props>) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const [summary, setSummary] = useState<ApplicationSummary>(
  EMPTY_APPLICATION_SUMMARY
);

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  const loadDashboardData = useCallback(async () => {
  setIsLoading(true);
  setErrorMessage(null);

  try {
    const [storedApplications, applicationSummary] =
      await Promise.all([
        getApplications(),
        getApplicationSummary(),
      ]);

    setApplications(storedApplications);
    setSummary(applicationSummary);
  } catch (error) {
    if (error instanceof ApiError) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(
        "Something went wrong while loading your dashboard."
      );
    }
  } finally {
    setIsLoading(false);
  }
}, []);

useFocusEffect(
  useCallback(() => {
    void loadDashboardData();
  }, [loadDashboardData])
);

const totalApplications = summary.total;
const interviewCount = summary.interview;
const offerCount = summary.offer;

const submittedApplications = summary.total - summary.saved;

const respondedApplications =
  summary.assessment +
  summary.interview +
  summary.offer +
  summary.rejected;

const responseRate =
  submittedApplications === 0
    ? 0
    : Math.round(
        (respondedApplications / submittedApplications) * 100
      );
  
const [isLoading, setIsLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState<string | null>(null);      

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

        {isLoading ? (
  <View style={styles.loadingCard}>
    <ActivityIndicator
      accessibilityLabel="Loading dashboard"
      size="large"
      color={colors.primary}
    />

    <Text style={styles.loadingText}>
      Loading your dashboard...
    </Text>
  </View>
) : errorMessage ? (
  <View style={styles.errorCard}>
    <Text style={styles.errorTitle}>
      Couldn't load your dashboard
    </Text>

    <Text style={styles.errorDescription}>
      {errorMessage}
    </Text>

    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Try loading the dashboard again"
      onPress={() => void loadDashboardData()}
      style={({ pressed }) => [
        styles.retryButton,
        pressed ? styles.addButtonPressed : undefined,
      ]}
    >
      <Text style={styles.retryButtonText}>Try again</Text>
    </Pressable>
  </View>
) : (
  <>
    <Text style={styles.sectionTitle}>Your progress</Text>

    <View style={styles.statsGrid}>
      <StatCard
        title="Applications"
        value={totalApplications}
        onPress={() =>
          navigation.navigate("Applications", {
            initialStatus: undefined,
          })
        }
      />

      <StatCard
        title="Interviews"
        value={interviewCount}
        onPress={() =>
          navigation.navigate("Applications", {
            initialStatus: "Interview",
          })
        }
      />

      <StatCard
        title="Offers"
        value={offerCount}
        onPress={() =>
          navigation.navigate("Applications", {
            initialStatus: "Offer",
          })
        }
      />

      <StatCard
        title="Response rate"
        value={`${responseRate}%`}
        onPress={() => {
          console.log("Analytics screen will be added later");
        }}
      />
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
          <Text style={styles.recentTitle}>
            Recent applications
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Applications")}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </Pressable>
        </View>

        {applications.slice(0, 3).map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            compact
            onPress={() =>
              navigation.navigate("ApplicationDetails", {
                applicationId: application.id,
              })
            }
          />
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
  </>
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

  loadingCard: {
  minHeight: 180,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 36,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 20,
  backgroundColor: colors.surface,
},

loadingText: {
  marginTop: 14,
  color: colors.textSecondary,
  fontSize: 15,
  fontWeight: "600",
},

errorCard: {
  marginTop: 36,
  padding: 24,
  borderWidth: 1,
  borderColor: colors.danger,
  borderRadius: 20,
  backgroundColor: colors.surface,
},

errorTitle: {
  color: colors.textPrimary,
  fontSize: 20,
  fontWeight: "700",
},

errorDescription: {
  marginTop: 10,
  color: colors.textSecondary,
  fontSize: 15,
  lineHeight: 22,
},

retryButton: {
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 20,
  borderRadius: 14,
  backgroundColor: colors.primary,
},

retryButtonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
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
});