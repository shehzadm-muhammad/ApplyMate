import { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import type { MainTabParamList } from "../navigation/mainTabTypes";
import { colors } from "../theme/colors";
import { saveApplication } from "../services/applicationStorage";

type Props = BottomTabScreenProps<MainTabParamList, "AddApplication">;

type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Offer"
  | "Rejected";

const statuses: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
];

export default function AddApplicationScreen({ navigation }: Props) {
  const [jobUrl, setJobUrl] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] =
    useState<ApplicationStatus>("Applied");
  const [notes, setNotes] = useState("");

  const companyRef = useRef<TextInput>(null);
  const jobTitleRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  const salaryRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  const isFormValid =
    company.trim().length > 0 &&
    jobTitle.trim().length > 0;

  const resetForm = () => {
  setJobUrl("");
  setCompany("");
  setJobTitle("");
  setLocation("");
  setSalary("");
  setStatus("Applied");
  setNotes("");
};

  const handleSave = async () => {
    if (!isFormValid) {
      return;
    }

    Keyboard.dismiss();

    await saveApplication({
      jobUrl: jobUrl.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      location: location.trim(),
      salary: salary.trim(),
      status,
      notes: notes.trim(),
    });

      resetForm();
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Add application</Text>

          <Text style={styles.description}>
            Paste a job link or enter the details manually.
          </Text>

          <View style={styles.smartImportCard}>
            <Text style={styles.smartImportTitle}>
              Smart job import
            </Text>

            <Text style={styles.smartImportDescription}>
              Paste a job link now. Automatic detail extraction will be
              added in a later version.
            </Text>

            <TextField
              label="Job link"
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              value={jobUrl}
              onChangeText={setJobUrl}
              onSubmitEditing={() => companyRef.current?.focus()}
            />
          </View>

          <Text style={styles.sectionTitle}>Application details</Text>

          <View style={styles.form}>
            <TextField
              ref={companyRef}
              label="Company"
              placeholder="e.g. HSBC"
              autoCapitalize="words"
              returnKeyType="next"
              value={company}
              onChangeText={setCompany}
              onSubmitEditing={() => jobTitleRef.current?.focus()}
            />

            <TextField
              ref={jobTitleRef}
              label="Job title"
              placeholder="e.g. Graduate Software Developer"
              autoCapitalize="words"
              returnKeyType="next"
              value={jobTitle}
              onChangeText={setJobTitle}
              onSubmitEditing={() => locationRef.current?.focus()}
            />

            <TextField
              ref={locationRef}
              label="Location"
              placeholder="e.g. Birmingham"
              autoCapitalize="words"
              returnKeyType="next"
              value={location}
              onChangeText={setLocation}
              onSubmitEditing={() => salaryRef.current?.focus()}
            />

            <TextField
              ref={salaryRef}
              label="Salary"
              placeholder="e.g. £30,000"
              keyboardType="numbers-and-punctuation"
              returnKeyType="next"
              value={salary}
              onChangeText={setSalary}
              onSubmitEditing={() => notesRef.current?.focus()}
            />
          </View>

          <Text style={styles.statusLabel}>Status</Text>

          <View style={styles.statusList}>
            {statuses.map((option) => {
              const isSelected = status === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => setStatus(option)}
                  style={[
                    styles.statusChip,
                    isSelected ? styles.statusChipSelected : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isSelected ? styles.statusTextSelected : undefined,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.notesSection}>
            <TextField
              ref={notesRef}
              label="Notes"
              placeholder="Add assessment dates, recruiter details or anything useful..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              returnKeyType="done"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <View style={styles.buttonSection}>
            <PrimaryButton
              title="Save Application"
              disabled={!isFormValid}
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },

  heading: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  description: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },

  smartImportCard: {
    marginTop: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  smartImportTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  smartImportDescription: {
    marginTop: 8,
    marginBottom: 18,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  sectionTitle: {
    marginTop: 30,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  form: {
    marginTop: 18,
    gap: 20,
  },

  statusLabel: {
    marginTop: 28,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  statusList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.background,
  },

  statusChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  statusText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  statusTextSelected: {
    color: "#FFFFFF",
  },

  notesSection: {
    marginTop: 28,
  },

  buttonSection: {
    marginTop: 30,
  },
});