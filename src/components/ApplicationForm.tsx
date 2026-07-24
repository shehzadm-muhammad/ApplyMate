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

import PrimaryButton from "./PrimaryButton";
import TextField from "./TextField";
import type {
  ApplicationStatus,
  JobApplication,
} from "../services/applicationService";
import { colors } from "../theme/colors";

export type ApplicationFormValues = Omit<
  JobApplication,
  "id" | "createdAt"
>;

type ApplicationFormProps = Readonly<{
  initialValues?: ApplicationFormValues;
  submitLabel: string;
  onSubmit: (values: ApplicationFormValues) => Promise<void> | void;
}>;

const statuses: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
];

const emptyValues: ApplicationFormValues = {
  jobUrl: "",
  company: "",
  jobTitle: "",
  location: "",
  salary: "",
  status: "Applied",
  notes: "",
  jobDescription: "",
  requiredSkills: "",
  benefits: "",
  recruiter: "",
  applicationDeadline: "",
};

export default function ApplicationForm({
  initialValues = emptyValues,
  submitLabel,
  onSubmit,
}: ApplicationFormProps) {
  const [jobUrl, setJobUrl] = useState(initialValues.jobUrl);
  const [company, setCompany] = useState(initialValues.company);
  const [jobTitle, setJobTitle] = useState(initialValues.jobTitle);
  const [location, setLocation] = useState(initialValues.location);
  const [salary, setSalary] = useState(initialValues.salary);

  const [status, setStatus] = useState<ApplicationStatus>(
    initialValues.status
  );

  const [recruiter, setRecruiter] = useState(initialValues.recruiter);
  const [applicationDeadline, setApplicationDeadline] = useState(
    initialValues.applicationDeadline
  );
  const [jobDescription, setJobDescription] = useState(
    initialValues.jobDescription
  );
  const [requiredSkills, setRequiredSkills] = useState(
    initialValues.requiredSkills
  );
  const [benefits, setBenefits] = useState(initialValues.benefits);
  const [notes, setNotes] = useState(initialValues.notes);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyRef = useRef<TextInput>(null);
  const jobTitleRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  const salaryRef = useRef<TextInput>(null);
  const recruiterRef = useRef<TextInput>(null);
  const deadlineRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const skillsRef = useRef<TextInput>(null);
  const benefitsRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  const isFormValid =
    company.trim().length > 0 &&
    jobTitle.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await onSubmit({
        jobUrl: jobUrl.trim(),
        company: company.trim(),
        jobTitle: jobTitle.trim(),
        location: location.trim(),
        salary: salary.trim(),
        status,
        recruiter: recruiter.trim(),
        applicationDeadline: applicationDeadline.trim(),
        jobDescription: jobDescription.trim(),
        requiredSkills: requiredSkills.trim(),
        benefits: benefits.trim(),
        notes: notes.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.smartImportCard}>
          <Text style={styles.smartImportTitle}>Smart job import</Text>

          <Text style={styles.smartImportDescription}>
            Paste a job link now. Automatic detail extraction will be added
            later.
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
            onSubmitEditing={() => recruiterRef.current?.focus()}
          />

          <TextField
            ref={recruiterRef}
            label="Recruiter or contact"
            placeholder="e.g. Sarah Jones"
            autoCapitalize="words"
            returnKeyType="next"
            value={recruiter}
            onChangeText={setRecruiter}
            onSubmitEditing={() => deadlineRef.current?.focus()}
          />

          <TextField
            ref={deadlineRef}
            label="Application deadline"
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            value={applicationDeadline}
            onChangeText={setApplicationDeadline}
            onSubmitEditing={() => descriptionRef.current?.focus()}
          />

          <TextField
            ref={descriptionRef}
            label="Job description"
            placeholder="Paste or enter the full job description..."
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            value={jobDescription}
            onChangeText={setJobDescription}
          />

          <TextField
            ref={skillsRef}
            label="Required skills"
            placeholder="e.g. Java, Spring Boot, SQL, AWS"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={requiredSkills}
            onChangeText={setRequiredSkills}
          />

          <TextField
            ref={benefitsRef}
            label="Benefits"
            placeholder="e.g. Hybrid working, pension, annual bonus"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={benefits}
            onChangeText={setBenefits}
          />
        </View>

        <Text style={styles.statusLabel}>Status</Text>

        <View style={styles.statusList}>
          {statuses.map((option) => {
            const isSelected = status === option;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
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
            title={isSubmitting ? "Saving..." : submitLabel}
            disabled={!isFormValid || isSubmitting}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },

  smartImportCard: {
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