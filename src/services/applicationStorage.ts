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

  jobDescription: string;
  requiredSkills: string;
  benefits: string;
  recruiter: string;
  applicationDeadline: string;

  createdAt: string;
};

export async function getApplications(): Promise<JobApplication[]> {
  const storedApplications = await AsyncStorage.getItem(APPLICATIONS_KEY);

  if (!storedApplications) {
    return [];
  }

  const parsedApplications = JSON.parse(
    storedApplications
  ) as Partial<JobApplication>[];

  return parsedApplications.map((application) => ({
    id: application.id ?? `${Date.now()}-${Math.random()}`,
    jobUrl: application.jobUrl ?? "",
    company: application.company ?? "",
    jobTitle: application.jobTitle ?? "",
    location: application.location ?? "",
    salary: application.salary ?? "",
    status: application.status ?? "Applied",
    notes: application.notes ?? "",

    jobDescription: application.jobDescription ?? "",
    requiredSkills: application.requiredSkills ?? "",
    benefits: application.benefits ?? "",
    recruiter: application.recruiter ?? "",
    applicationDeadline: application.applicationDeadline ?? "",

    createdAt: application.createdAt ?? new Date().toISOString(),
  }));
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

export async function updateApplication(
  id: string,
  updates: Omit<JobApplication, "id" | "createdAt">
): Promise<JobApplication | null> {
  const applications = await getApplications();

  const existingApplication = applications.find(
    (application) => application.id === id
  );

  if (!existingApplication) {
    return null;
  }

  const updatedApplication: JobApplication = {
    ...existingApplication,
    ...updates,
    id: existingApplication.id,
    createdAt: existingApplication.createdAt,
  };

  const updatedApplications = applications.map((application) =>
    application.id === id ? updatedApplication : application
  );

  await AsyncStorage.setItem(
    APPLICATIONS_KEY,
    JSON.stringify(updatedApplications)
  );

  return updatedApplication;
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