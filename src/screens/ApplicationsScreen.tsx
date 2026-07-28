import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  Modal,
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
} from "../services/applicationService";
import { colors } from "../theme/colors";
import ApplicationCard from "../components/ApplicationCard";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import type { RootStackParamList } from "../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<
    MainTabParamList,
    "Applications"
  >,
  NativeStackScreenProps<RootStackParamList>
>;

type StatusFilter = "All" | ApplicationStatus;

type SortOption = "Newest" | "Oldest" | "Company A-Z";

const filters: StatusFilter[] = [
  "All",
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
];

const sortOptions: SortOption[] = [
  "Newest",
  "Oldest",
  "Company A-Z",
];

export default function ApplicationsScreen({
  navigation,
  route,
}: Readonly<Props>) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("All");
  const [selectedSort, setSelectedSort] =
  useState<SortOption>("Newest");  
  const [isSortMenuOpen, setIsSortMenuOpen] =
  useState(false);
  const sortButtonRef = useRef<View>(null);

const [sortMenuPosition, setSortMenuPosition] = useState({
  top: 0,
  left: 0,
});


useEffect(() => {
  setSelectedStatus(route.params?.initialStatus ?? "All");
  setSearchQuery("");
}, [
  route.params?.initialStatus,
  route.params?.resetKey,
]);

  useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const loadApplications = async () => {
      try {
        const backendApplications = await getApplications();

        if (isActive) {
          setApplications(backendApplications);
        }
      } catch (error) {
        console.error("Unable to load applications:", error);

        if (isActive) {
          setApplications([]);
        }
      }
    };

    void loadApplications();

    return () => {
      isActive = false;
    };
  }, [])
);

const visibleApplications = useMemo(() => {
  const normalisedSearch = searchQuery.trim().toLowerCase();

  const matchingApplications = applications.filter(
    (application) => {
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
    }
  );

  return [...matchingApplications].sort((first, second) => {
    if (selectedSort === "Oldest") {
      return (
        new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime()
      );
    }

    if (selectedSort === "Company A-Z") {
      return first.company.localeCompare(second.company);
    }

    return (
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
    );
  });
}, [
  applications,
  searchQuery,
  selectedStatus,
  selectedSort,
]);

const handleSortButtonPress = () => {
  if (isSortMenuOpen) {
    setIsSortMenuOpen(false);
    return;
  }

  sortButtonRef.current?.measureInWindow(
    (x, y, width, height) => {
      const menuWidth = 200;

      setSortMenuPosition({
        top: y + height + 8,
        left: Math.max(16, x + width - menuWidth),
      });

      setIsSortMenuOpen(true);
    }
  );
};

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
    Showing {visibleApplications.length}{" "}
    {visibleApplications.length === 1
      ? "application"
      : "applications"}
  </Text>

<Pressable
  ref={sortButtonRef}
  accessibilityRole="button"
  accessibilityLabel={`Sort applications. Current sorting: ${selectedSort}`}
  accessibilityState={{ expanded: isSortMenuOpen }}
  onPress={handleSortButtonPress}
  style={({ pressed }) => [
    styles.sortIconButton,
    pressed ? styles.buttonPressed : undefined,
  ]}
>
  <Ionicons
    name="swap-vertical-outline"
    size={21}
    color={colors.textPrimary}
  />
</Pressable>
</View>

        {visibleApplications.length === 0 ? (
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
        visibleApplications.map((application) => (
        <ApplicationCard
            key={application.id}
            application={application}
            onPress={() =>
            navigation.navigate("ApplicationDetails", {
                applicationId: application.id,
            })
            }
        />
        ))
    )}
      </ScrollView>
      <Modal
  transparent
  visible={isSortMenuOpen}
  animationType="fade"
  statusBarTranslucent
  onRequestClose={() => setIsSortMenuOpen(false)}
>
  <View style={styles.sortModalRoot}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close sorting menu"
      onPress={() => setIsSortMenuOpen(false)}
      style={styles.sortBackdrop}
    />

    <View
      style={[
        styles.sortMenu,
        {
          top: sortMenuPosition.top,
          left: sortMenuPosition.left,
        },
      ]}
    >
      <Text style={styles.sortMenuTitle}>
        Sort applications
      </Text>

      {sortOptions.map((option) => {
        const isSelected = selectedSort === option;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => {
              setSelectedSort(option);
              setIsSortMenuOpen(false);
            }}
            style={({ pressed }) => [
              styles.sortMenuOption,
              isSelected
                ? styles.sortMenuOptionSelected
                : undefined,
              pressed ? styles.buttonPressed : undefined,
            ]}
          >
            <Text
              style={[
                styles.sortMenuOptionText,
                isSelected
                  ? styles.sortMenuOptionTextSelected
                  : undefined,
              ]}
            >
              {option}
            </Text>

            {isSelected ? (
              <Ionicons
                name="checkmark"
                size={19}
                color={colors.primary}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  </View>
</Modal>
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

  resultsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
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

  resultsHeader: {
  position: "relative",
  zIndex: 20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
},

sortIconButton: {
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  backgroundColor: colors.surface,
},

sortMenu: {
  position: "absolute",
  width: 200,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 16,
  backgroundColor: colors.surface,

  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 8,
  },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 8,
},

sortMenuTitle: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  color: colors.textSecondary,
  fontSize: 13,
  fontWeight: "700",
},

sortMenuOption: {
  minHeight: 44,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 14,
},

sortMenuOptionSelected: {
  backgroundColor: colors.background,
},

sortMenuOptionText: {
  color: colors.textPrimary,
  fontSize: 15,
  fontWeight: "600",
},

sortMenuOptionTextSelected: {
  color: colors.primary,
},

sortModalRoot: {
  flex: 1,
},

sortBackdrop: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "transparent",
},

});