import { apiRequest } from "./apiClient";

export type ReminderType =
  | "Interview"
  | "Assessment"
  | "Follow-up"
  | "Deadline"
  | "Other";

export type Reminder = {
  id: string;
  title: string;
  company: string;
  type: ReminderType;
  dueDate: string;
  dueTime: string;
  notes: string;
  completed: boolean;
  createdAt: string;
};

export type NewReminder = Omit<
  Reminder,
  "id" | "completed" | "createdAt"
>;

type BackendReminderType =
  | "INTERVIEW"
  | "ASSESSMENT"
  | "FOLLOW_UP"
  | "DEADLINE"
  | "OTHER";

type BackendReminder = {
  id: string;
  title: string;
  company: string;
  type: BackendReminderType;
  dueAt: string;
  notes: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type BackendReminderRequest = {
  title: string;
  company: string;
  type: BackendReminderType;
  dueAt: string;
  notes: string;
  completed?: boolean;
};

const frontendTypeMap: Record<BackendReminderType, ReminderType> = {
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  FOLLOW_UP: "Follow-up",
  DEADLINE: "Deadline",
  OTHER: "Other",
};

const backendTypeMap: Record<ReminderType, BackendReminderType> = {
  Interview: "INTERVIEW",
  Assessment: "ASSESSMENT",
  "Follow-up": "FOLLOW_UP",
  Deadline: "DEADLINE",
  Other: "OTHER",
};

function mapBackendReminder(reminder: BackendReminder): Reminder {
  const dueAt = new Date(reminder.dueAt);

  return {
    id: reminder.id,
    title: reminder.title,
    company: reminder.company,
    type: frontendTypeMap[reminder.type],
    dueDate: `${dueAt.getFullYear()}-${String(dueAt.getMonth() + 1).padStart(2, "0")}-${String(dueAt.getDate()).padStart(2, "0")}`,
    dueTime: `${String(dueAt.getHours()).padStart(2, "0")}:${String(dueAt.getMinutes()).padStart(2, "0")}`,
    notes: reminder.notes,
    completed: reminder.completed,
    createdAt: reminder.createdAt,
  };
}

function toDueAt(dueDate: string, dueTime: string): string {
  return new Date(`${dueDate}T${dueTime}:00`).toISOString();
}

function mapCreateRequest(reminder: NewReminder): BackendReminderRequest {
  return {
    title: reminder.title,
    company: reminder.company,
    type: backendTypeMap[reminder.type],
    dueAt: toDueAt(reminder.dueDate, reminder.dueTime),
    notes: reminder.notes,
  };
}

function mapUpdateRequest(reminder: Reminder): BackendReminderRequest {
  return {
    title: reminder.title,
    company: reminder.company,
    type: backendTypeMap[reminder.type],
    dueAt: toDueAt(reminder.dueDate, reminder.dueTime),
    notes: reminder.notes,
    completed: reminder.completed,
  };
}

export async function getReminders(): Promise<Reminder[]> {
  const reminders = await apiRequest<BackendReminder[]>("/api/v1/reminders");
  return reminders.map(mapBackendReminder);
}

export async function saveReminder(values: NewReminder): Promise<Reminder> {
  const reminder = await apiRequest<BackendReminder>("/api/v1/reminders", {
    method: "POST",
    body: mapCreateRequest(values),
  });

  return mapBackendReminder(reminder);
}

export async function updateReminder(reminder: Reminder): Promise<Reminder> {
  const updatedReminder = await apiRequest<BackendReminder>(
    `/api/v1/reminders/${reminder.id}`,
    {
      method: "PUT",
      body: mapUpdateRequest(reminder),
    }
  );

  return mapBackendReminder(updatedReminder);
}

export async function deleteReminder(id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/reminders/${id}`, {
    method: "DELETE",
  });
}