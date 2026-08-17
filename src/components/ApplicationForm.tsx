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
import { ApiError } from "../services/apiClient";
import type {
  ApplicationStatus,
  JobApplication,
  JobImportPreview,
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
  onImportJob?: (url: string) => Promise<JobImportPreview>;
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

function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  const minutes = Math.ceil(seconds / 60);

  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function getImportErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const retryAfterSeconds =
      error.response?.retryAfterSeconds;

    if (
      error.status === 429 &&
      retryAfterSeconds &&
      retryAfterSeconds > 0
    ) {
      return `${error.message} Try again in ${formatRetryAfter(
        retryAfterSeconds
      )}.`;
    }

    return error.message;
  }

  return "We couldn't import this job automatically.";
}

export default function ApplicationForm({
  initialValues = emptyValues,
  submitLabel,
  onSubmit,
  onImportJob,
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
  const [isImporting, setIsImporting] = useState(false);

  const [importSucceeded, setImportSucceeded] =
    useState(false);

  const [importError, setImportError] = useState("");

  const [importWarnings, setImportWarnings] =
    useState<string[]>([]);

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

  const clearImportFeedback = () => {
    setImportSucceeded(false);
    setImportError("");
    setImportWarnings([]);
  };

  const handleJobUrlChange = (value: string) => {
    setJobUrl(value);
    clearImportFeedback();
  };

  const handleImport = async () => {
    if (!onImportJob || isImporting) {
      return;
    }

    const requestedUrl = jobUrl.trim();

    if (!requestedUrl) {
      setImportSucceeded(false);
      setImportWarnings([]);
      setImportError("Paste a job link first.");
      return;
    }

    Keyboard.dismiss();

    setIsImporting(true);
    setImportSucceeded(false);
    setImportError("");
    setImportWarnings([]);

    try {
      const preview =
        await onImportJob(requestedUrl);

      setJobUrl(
        preview.jobUrl.trim() || requestedUrl
      );

      /*
       * Never erase information the user has already entered
       * when the importer could not detect that field.
       */
      setCompany(
        (current) =>
          preview.company.trim() || current
      );

      setJobTitle(
        (current) =>
          preview.jobTitle.trim() || current
      );

      setLocation(
        (current) =>
          preview.location.trim() || current
      );

      setSalary(
        (current) =>
          preview.salary.trim() || current
      );

      setRecruiter(
        (current) =>
          preview.recruiter.trim() || current
      );

      setApplicationDeadline(
        (current) =>
          preview.applicationDeadline?.trim() ||
          current
      );

      setJobDescription(
        (current) =>
          preview.jobDescription.trim() || current
      );

      setRequiredSkills(
        (current) =>
          preview.requiredSkills.trim() || current
      );

      setBenefits(
        (current) =>
          preview.benefits.trim() || current
      );

      /*
       * Status and notes intentionally remain untouched.
       */
      setImportWarnings(preview.warnings);
      setImportSucceeded(true);
    } catch (error) {
      setImportError(
        getImportErrorMessage(error)
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !isFormValid ||
      isSubmitting ||
      isImporting
    ) {
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
        applicationDeadline:
          applicationDeadline.trim(),
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
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.smartImportCard}>
          {onImportJob ? (
            <>
              <Text style={styles.smartImportTitle}>
                Smart job import
              </Text>

              <Text
                style={styles.smartImportDescription}
              >
                Paste a public job link and ApplyMate
                will try to fill in the details for you.
              </Text>
            </>
          ) : null}

          <TextField
            label="Job link"
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={jobUrl}
            onChangeText={handleJobUrlChange}
            onSubmitEditing={() =>
              companyRef.current?.focus()
            }
          />

          {onImportJob ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Import job details"
              accessibilityState={{
                disabled:
                  isImporting ||
                  jobUrl.trim().length === 0,
              }}
              disabled={
                isImporting ||
                jobUrl.trim().length === 0
              }
              onPress={() => {
                void handleImport();
              }}
              style={({ pressed }) => [
                styles.importButton,
                isImporting ||
                jobUrl.trim().length === 0
                  ? styles.importButtonDisabled
                  : undefined,
                pressed && !isImporting
                  ? styles.importButtonPressed
                  : undefined,
              ]}
            >
              <Text style={styles.importButtonText}>
                {isImporting
                  ? "Importing..."
                  : "Import job details"}
              </Text>
            </Pressable>
          ) : null}

          {importSucceeded ? (
            <View style={styles.importFeedback}>
              <Text style={styles.importSuccess}>
                Job details imported. Review everything
                before saving.
              </Text>

              {importWarnings.map((warning) => (
                <Text
                  key={warning}
                  style={styles.importWarning}
                >
                  • {warning}
                </Text>
              ))}
            </View>
          ) : null}

          {importError ? (
            <View style={styles.importFeedback}>
              <Text style={styles.importError}>
                {importError}
              </Text>

              <Text style={styles.manualEntryText}>
                You can still enter the job details
                manually below.
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>
          Application details
        </Text>

        <View style={styles.form}>
          <TextField
            ref={companyRef}
            label="Company"
            placeholder="e.g. HSBC"
            autoCapitalize="words"
            returnKeyType="next"
            value={company}
            onChangeText={setCompany}
            onSubmitEditing={() =>
              jobTitleRef.current?.focus()
            }
          />

          <TextField
            ref={jobTitleRef}
            label="Job title"
            placeholder="e.g. Graduate Software Developer"
            autoCapitalize="words"
            returnKeyType="next"
            value={jobTitle}
            onChangeText={setJobTitle}
            onSubmitEditing={() =>
              locationRef.current?.focus()
            }
          />

          <TextField
            ref={locationRef}
            label="Location"
            placeholder="e.g. Birmingham"
            autoCapitalize="words"
            returnKeyType="next"
            value={location}
            onChangeText={setLocation}
            onSubmitEditing={() =>
              salaryRef.current?.focus()
            }
          />

          <TextField
            ref={salaryRef}
            label="Salary"
            placeholder="e.g. £30,000"
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            value={salary}
            onChangeText={setSalary}
            onSubmitEditing={() =>
              recruiterRef.current?.focus()
            }
          />

          <TextField
            ref={recruiterRef}
            label="Recruiter or contact"
            placeholder="e.g. Sarah Jones"
            autoCapitalize="words"
            returnKeyType="next"
            value={recruiter}
            onChangeText={setRecruiter}
            onSubmitEditing={() =>
              deadlineRef.current?.focus()
            }
          />

          <TextField
            ref={deadlineRef}
            label="Application deadline"
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
            value={applicationDeadline}
            onChangeText={setApplicationDeadline}
            onSubmitEditing={() =>
              descriptionRef.current?.focus()
            }
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

        <Text style={styles.statusLabel}>
          Status
        </Text>

        <View style={styles.statusList}>
          {statuses.map((option) => {
            const isSelected =
              status === option;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                onPress={() =>
                  setStatus(option)
                }
                style={[
                  styles.statusChip,
                  isSelected
                    ? styles.statusChipSelected
                    : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isSelected
                      ? styles.statusTextSelected
                      : undefined,
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
            title={
              isSubmitting
                ? "Saving..."
                : submitLabel
            }
            disabled={
              !isFormValid ||
              isSubmitting ||
              isImporting
            }
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

  importButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },

  importButtonDisabled: {
    opacity: 0.45,
  },

  importButtonPressed: {
    opacity: 0.8,
  },

  importButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  importFeedback: {
    marginTop: 16,
    gap: 6,
  },

  importSuccess: {
    color: "#027A48",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  importWarning: {
    color: "#8A4B08",
    fontSize: 13,
    lineHeight: 19,
  },

  importError: {
    color: "#B42318",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  manualEntryText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
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