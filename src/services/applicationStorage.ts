import AsyncStorage from "@react-native-async-storage/async-storage";

const APPLICATIONS_KEY = "@applymate/applications";

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Assessment"
  | "Interview"
  | "Offer"
  | "Rejected";

export type JobApplication = {
  id: string;
  jobUrl: string;
  company: string;
  jobTitle: string;
  location: string;
  salary: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
};

export async function getApplications(): Promise<JobApplication[]> {
  const storedApplications = await AsyncStorage.getItem(APPLICATIONS_KEY);

  if (!storedApplications) {
    return [];
  }

  return JSON.parse(storedApplications) as JobApplication[];
}

export async function getApplicationById(
    id: string
): Promise<JobApplication | null> {
  const applications = await getApplications();
  return (
    applications.find((application) => application.id === id) ?? null
);
}

export async function saveApplication(
  application: Omit<JobApplication, "id" | "createdAt">
): Promise<JobApplication> {
  const existingApplications = await getApplications();

  const newApplication: JobApplication = {
    ...application,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  const updatedApplications = [newApplication, ...existingApplications];

  await AsyncStorage.setItem(
    APPLICATIONS_KEY,
    JSON.stringify(updatedApplications)
  );

  return newApplication;
}

export async function deleteApplication(id: string): Promise<void> {
  const applications = await getApplications();

  const updatedApplications = applications.filter(
    (application) => application.id !== id
  );

  await AsyncStorage.setItem(
    APPLICATIONS_KEY,
    JSON.stringify(updatedApplications)
  );
}