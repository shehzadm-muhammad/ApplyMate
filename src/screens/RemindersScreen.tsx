import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../components/PrimaryButton";
import TextField from "../components/TextField";
import { useAuth } from "../context/AuthContext";
import {
  deleteReminder,
  getReminders,
  saveReminder,
  updateReminder,
  type Reminder,
  type ReminderType,
} from "../services/reminderService";
import {
  getReminderNotificationId,
  setReminderNotificationId,
} from "../services/reminderStorage";
import {
  cancelReminderNotification,
  scheduleReminderNotification,
} from "../services/notificationService";
import { colors } from "../theme/colors";

const reminderTypes: ReminderType[] = [
  "Interview",
  "Assessment",
  "Follow-up",
  "Deadline",
  "Other",
];

export default function RemindersScreen() {
  const { user } = useAuth();
  const userId = user?.id;

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const [editingReminderId, setEditingReminderId] = useState<string | null>(
  null
);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState<ReminderType>("Interview");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [notes, setNotes] = useState("");

  const [touched, setTouched] = useState({
    title: false,
    date: false,
    time: false,
  });

  const loadReminders = useCallback(async () => {
    if (!userId) {
      setReminders([]);
      return;
    }

    const backendReminders = await getReminders();
    setReminders(backendReminders);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void loadReminders();
    }, [loadReminders])
  );

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((first, second) => {
      if (first.completed !== second.completed) {
        return first.completed ? 1 : -1;
      }

      const firstDate = new Date(
        `${first.dueDate}T${first.dueTime || "00:00"}`
      ).getTime();

      const secondDate = new Date(
        `${second.dueDate}T${second.dueTime || "00:00"}`
      ).getTime();

      return firstDate - secondDate;
    });
  }, [reminders]);

  const markAsTouched = (field: keyof typeof touched) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }));
  };

  const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(dueDate);

  const parsedDueDate = isValidDateFormat
    ? new Date(`${dueDate}T00:00:00`)
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isRealDate =
    parsedDueDate !== null &&
    !Number.isNaN(parsedDueDate.getTime()) &&
    parsedDueDate.getFullYear() === Number(dueDate.slice(0, 4)) &&
    parsedDueDate.getMonth() + 1 === Number(dueDate.slice(5, 7)) &&
    parsedDueDate.getDate() === Number(dueDate.slice(8, 10));

  const isDateInFuture =
    parsedDueDate !== null &&
    parsedDueDate.getTime() >= today.getTime();

  const isDateValid = isRealDate && isDateInFuture;

  const isTimeValid =
  /^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime);

const parsedReminderDateTime =
  isDateValid && isTimeValid
    ? new Date(`${dueDate}T${dueTime}:00`)
    : null;

const isReminderDateTimeInFuture =
  parsedReminderDateTime !== null &&
  parsedReminderDateTime.getTime() > Date.now();

const isFormValid =
  title.trim().length > 0 &&
  isDateValid &&
  isTimeValid &&
  isReminderDateTimeInFuture;

  const titleError =
    touched.title && title.trim().length === 0
      ? "Enter a reminder title"
      : undefined;

  const dateError =
    touched.date && dueDate.length === 0
      ? "Enter a reminder date"
      : touched.date && !isValidDateFormat
        ? "Use the format YYYY-MM-DD"
        : touched.date && !isRealDate
          ? "Enter a real calendar date"
          : touched.date && !isDateInFuture
            ? "Reminder date cannot be in the past"
            : undefined;

const timeError =
  touched.time && dueTime.length === 0
    ? "Enter a reminder time"
    : touched.time && !isTimeValid
      ? "Use 24-hour format, for example 14:30"
      : touched.time &&
          isDateValid &&
          !isReminderDateTimeInFuture
        ? "Reminder time must be in the future"
        : undefined;

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setType("Interview");
    setDueDate("");
    setDueTime("");
    setNotes("");
    setEditingReminderId(null);

    setTouched({
      title: false,
      date: false,
      time: false,
    });
  };

  const handleEdit = (reminder: Reminder) => {
  setEditingReminderId(reminder.id);
  setIsAdding(true);

  setTitle(reminder.title);
  setCompany(reminder.company);
  setType(reminder.type);
  setDueDate(reminder.dueDate);
  setDueTime(reminder.dueTime);
  setNotes(reminder.notes);

  setTouched({
    title: false,
    date: false,
    time: false,
  });
};

const handleSave = async () => {
  if (!userId) {
    return;
  }

  setTouched({
    title: true,
    date: true,
    time: true,
  });

  if (!isFormValid) {
    return;
  }

  const values = {
    title: title.trim(),
    company: company.trim(),
    type,
    dueDate,
    dueTime,
    notes: notes.trim(),
  };

  try {
    if (editingReminderId) {
      const existingReminder = reminders.find(
        (reminder) => reminder.id === editingReminderId
      );

      if (!existingReminder) {
        return;
      }

      const previousNotificationId =
        await getReminderNotificationId(
          userId,
          existingReminder.id
        );

      await cancelReminderNotification(previousNotificationId);

      const updatedReminder = await updateReminder({
        ...existingReminder,
        ...values,
      });

      const notificationId = updatedReminder.completed
        ? null
        : await scheduleReminderNotification({
            reminderId: updatedReminder.id,
            title: updatedReminder.title,
            company: updatedReminder.company,
            type: updatedReminder.type,
            dueDate: updatedReminder.dueDate,
            dueTime: updatedReminder.dueTime,
          });

      await setReminderNotificationId(
        userId,
        updatedReminder.id,
        notificationId
      );
    } else {
      const createdReminder = await saveReminder(values);

      const notificationId =
        await scheduleReminderNotification({
          reminderId: createdReminder.id,
          title: createdReminder.title,
          company: createdReminder.company,
          type: createdReminder.type,
          dueDate: createdReminder.dueDate,
          dueTime: createdReminder.dueTime,
        });

      await setReminderNotificationId(
        userId,
        createdReminder.id,
        notificationId
      );
    }

    resetForm();
    setIsAdding(false);
    await loadReminders();
  } catch (error) {
    console.error("Unable to save reminder:", error);
    Alert.alert(
      "Unable to save reminder",
      "Please check your connection and try again."
    );
  }
};

  const handleToggle = async (id: string) => {
    if (!userId) {
      return;
    }

    const reminder = reminders.find(
      (item) => item.id === id
    );

    if (!reminder) {
      return;
    }

    try {
      const completed = !reminder.completed;
      const notificationId =
        await getReminderNotificationId(userId, id);

      if (completed) {
        await cancelReminderNotification(notificationId);
      }

      const updatedReminder = await updateReminder({
        ...reminder,
        completed,
      });

      const nextNotificationId = completed
        ? null
        : await scheduleReminderNotification({
            reminderId: updatedReminder.id,
            title: updatedReminder.title,
            company: updatedReminder.company,
            type: updatedReminder.type,
            dueDate: updatedReminder.dueDate,
            dueTime: updatedReminder.dueTime,
          });

      await setReminderNotificationId(
        userId,
        id,
        nextNotificationId
      );

      await loadReminders();
    } catch (error) {
      console.error("Unable to update reminder:", error);
      Alert.alert(
        "Unable to update reminder",
        "Please check your connection and try again."
      );
    }
  };

  const handleDelete = (reminder: Reminder) => {
    Alert.alert(
      "Delete reminder?",
      `Delete “${reminder.title}”?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              if (!userId) {
                return;
              }

              try {
                const notificationId =
                  await getReminderNotificationId(
                    userId,
                    reminder.id
                  );

                await cancelReminderNotification(
                  notificationId
                );
                await deleteReminder(reminder.id);
                await setReminderNotificationId(
                  userId,
                  reminder.id,
                  null
                );
                await loadReminders();
              } catch (error) {
                console.error(
                  "Unable to delete reminder:",
                  error
                );
                Alert.alert(
                  "Unable to delete reminder",
                  "Please check your connection and try again."
                );
              }
            })();
          },
        },
      ]
    );
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
          <View style={styles.header}>
            <View>
              <Text style={styles.heading}>Reminders</Text>

              <Text style={styles.description}>
                Keep track of interviews, assessments and follow-ups.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isAdding ? "Close reminder form" : "Add reminder"
              }
              onPress={() => {
                setIsAdding((current) => !current);

                if (isAdding) {
                  resetForm();
                }
              }}
              style={({ pressed }) => [
                styles.headerButton,
                pressed ? styles.pressed : undefined,
              ]}
            >
              <Ionicons
                name={isAdding ? "close" : "add"}
                size={26}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {isAdding ? (
            <View style={styles.formCard}>
<Text style={styles.formTitle}>
  {editingReminderId ? "Edit reminder" : "Add reminder"}
</Text>
              <View style={styles.form}>
                <TextField
                  label="Reminder title"
                  placeholder="e.g. Barclays interview"
                  value={title}
                  onChangeText={setTitle}
                  onBlur={() => markAsTouched("title")}
                  error={titleError}
                />

                <TextField
                  label="Company"
                  placeholder="e.g. Barclays"
                  autoCapitalize="words"
                  value={company}
                  onChangeText={setCompany}
                />

                <Text style={styles.fieldLabel}>Reminder type</Text>

                <View style={styles.typeList}>
                  {reminderTypes.map((option) => {
                    const isSelected = option === type;

                    return (
                      <Pressable
                        key={option}
                        onPress={() => setType(option)}
                        style={[
                          styles.typeChip,
                          isSelected
                            ? styles.typeChipSelected
                            : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeText,
                            isSelected
                              ? styles.typeTextSelected
                              : undefined,
                          ]}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextField
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                  value={dueDate}
                  onChangeText={setDueDate}
                  onBlur={() => markAsTouched("date")}
                  error={dateError}
                />

                <TextField
                  label="Time"
                  placeholder="14:30"
                  keyboardType="numbers-and-punctuation"
                  value={dueTime}
                  onChangeText={setDueTime}
                  onBlur={() => markAsTouched("time")}
                  error={timeError}
                />

                <TextField
                  label="Notes"
                  placeholder="Add anything useful..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <View style={styles.saveButton}>
                <PrimaryButton
                  title={
                    editingReminderId ? "Save Changes" : "Save Reminder"
                  }
                  onPress={handleSave}
                />
              </View>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Upcoming</Text>

          {sortedReminders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="notifications-outline"
                size={34}
                color={colors.primary}
              />

              <Text style={styles.emptyTitle}>No reminders yet</Text>

              <Text style={styles.emptyDescription}>
                Add interview, assessment or follow-up reminders so nothing
                gets missed.
              </Text>
            </View>
          ) : (
            sortedReminders.map((reminder) => (
              <View
                key={reminder.id}
                style={[
                  styles.reminderCard,
                  reminder.completed
                    ? styles.reminderCardCompleted
                    : undefined,
                ]}
              >
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: reminder.completed,
                  }}
                  onPress={() => {
                    void handleToggle(reminder.id);
                  }}
                  style={[
                    styles.checkbox,
                    reminder.completed
                      ? styles.checkboxCompleted
                      : undefined,
                  ]}
                >
                  {reminder.completed ? (
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#FFFFFF"
                    />
                  ) : null}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${reminder.title}`}
                  onPress={() => handleEdit(reminder)}
                  style={styles.reminderContent}
                >
                  <View style={styles.reminderTopRow}>
                    <Text
                      style={[
                        styles.reminderTitle,
                        reminder.completed
                          ? styles.completedText
                          : undefined,
                      ]}
                    >
                      {reminder.title}
                    </Text>

                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {reminder.type}
                      </Text>
                    </View>
                  </View>

                  {reminder.company ? (
                    <Text style={styles.company}>
                      {reminder.company}
                    </Text>
                  ) : null}

                  <Text style={styles.date}>
                    {new Date(
                      `${reminder.dueDate}T${
                        reminder.dueTime || "00:00"
                      }`
                    ).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}

                    {reminder.dueTime
                      ? ` · ${reminder.dueTime}`
                      : ""}
                  </Text>

                  {reminder.notes ? (
                    <Text style={styles.notes} numberOfLines={2}>
                      {reminder.notes}
                    </Text>
                  ) : null}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete reminder"
                  hitSlop={10}
                  onPress={() => handleDelete(reminder)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color={colors.danger}
                  />
                </Pressable>
              </View>
            ))
          )}
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

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  heading: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  description: {
    maxWidth: 290,
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },

  headerButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primary,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  formCard: {
    marginTop: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  formTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  form: {
    gap: 20,
    marginTop: 22,
  },

  fieldLabel: {
    marginBottom: -10,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },

  typeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  typeChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.background,
  },

  typeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  typeText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  typeTextSelected: {
    color: "#FFFFFF",
  },

  saveButton: {
    marginTop: 26,
  },

  sectionTitle: {
    marginTop: 32,
    marginBottom: 14,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  emptyCard: {
    alignItems: "center",
    padding: 30,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  emptyTitle: {
    marginTop: 14,
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "700",
  },

  emptyDescription: {
    marginTop: 9,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    marginBottom: 12,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  reminderCardCompleted: {
    opacity: 0.58,
  },

  checkbox: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
  },

  checkboxCompleted: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  reminderContent: {
    flex: 1,
  },

  reminderTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  reminderTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },

  completedText: {
    textDecorationLine: "line-through",
  },

  typeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },

  typeBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  company: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
  },

  date: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  notes: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});