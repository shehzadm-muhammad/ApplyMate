import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MainTabParamList } from "../navigation/mainTabTypes";
import {
  getApplications,
  type ApplicationStatus,
  type JobApplication,
} from "../services/applicationStorage";
import { colors } from "../theme/colors";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<
    MainTabParamList,
    "Applications"
  >,
  NativeStackScreenProps<RootStackParamList>
>;

type StatusFilter = "All" | ApplicationStatus;

const filters: StatusFilter[] = [
  "All",
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
];

export default function ApplicationsScreen({
  navigation,
  route,
}: Props) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("All");

  useEffect(() => {
    if (route.params?.initialStatus) {
      setSelectedStatus(route.params.initialStatus);
    }
  }, [route.params?.initialStatus]);

  useFocusEffect(
    useCallback(() => {
      const loadApplications = async () => {
        const storedApplications = await getApplications();
        setApplications(storedApplications);
      };

      void loadApplications();
    }, [])
  );

  const filteredApplications = useMemo(() => {
    const normalisedSearch = searchQuery.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        selectedStatus === "All" ||
        application.status === selectedStatus;

      const matchesSearch =
        normalisedSearch.length === 0 ||
        application.company
          .toLowerCase()
          .includes(normalisedSearch) ||
        application.jobTitle
          .toLowerCase()
          .includes(normalisedSearch) ||
        application.location
          .toLowerCase()
          .includes(normalisedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchQuery, selectedStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.heading}>Applications</Text>

        <Text style={styles.description}>
          Track every opportunity in one place.
        </Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search company, role or location"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => {
            const isSelected = selectedStatus === filter;

            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                onPress={() => setSelectedStatus(filter)}
                style={[
                  styles.filterChip,
                  isSelected
                    ? styles.filterChipSelected
                    : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected
                      ? styles.filterTextSelected
                      : undefined,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredApplications.length}{" "}
            {filteredApplications.length === 1
              ? "application"
              : "applications"}
          </Text>
        </View>

        {filteredApplications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No matching applications
            </Text>

            <Text style={styles.emptyDescription}>
              {applications.length === 0
                ? "Add your first application to begin tracking your job search."
                : "Try changing your search or selected status."}
            </Text>

            {applications.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  navigation.navigate("AddApplication")
                }
                style={({ pressed }) => [
                  styles.addButton,
                  pressed ? styles.buttonPressed : undefined,
                ]}
              >
                <Text style={styles.addButtonText}>
                  Add Application
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          filteredApplications.map((application) => (
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
              <View style={styles.applicationMain}>
                <Text
                  style={styles.companyName}
                  numberOfLines={1}
                >
                  {application.company}
                </Text>

                <Text
                  style={styles.jobTitle}
                  numberOfLines={2}
                >
                  {application.jobTitle}
                </Text>

                {application.location ? (
                  <Text
                    style={styles.location}
                    numberOfLines={1}
                  >
                    {application.location}
                  </Text>
                ) : null}
              </View>

              <View style={styles.cardRight}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {application.status}
                  </Text>
                </View>

                <Text style={styles.dateText}>
                  {new Date(
                    application.createdAt
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            </Pressable>
          ))
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

  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  heading: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  description: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },

  searchContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  searchIcon: {
    marginRight: 10,
    color: colors.textSecondary,
    fontSize: 22,
  },

  searchInput: {
    flex: 1,
    minHeight: 52,
    color: colors.textPrimary,
    fontSize: 15,
  },

  filtersContent: {
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },

  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.background,
  },

  filterChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  filterTextSelected: {
    color: "#FFFFFF",
  },

  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  resultsHeader: {
    marginBottom: 12,
  },

  resultsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  applicationCard: {
    minHeight: 112,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },

  applicationMain: {
    flex: 1,
    paddingRight: 14,
  },

  companyName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },

  jobTitle: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  location: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
  },

  cardRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
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

  dateText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  emptyCard: {
    marginTop: 24,
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

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});