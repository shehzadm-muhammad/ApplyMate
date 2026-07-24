import { apiRequest } from "./apiClient";

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

export type ApplicationFormValues = Omit<
  JobApplication,
  "id" | "createdAt"
>;

type BackendApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED";

type BackendJobApplication = {
  id: string;
  jobUrl: string | null;
  company: string;
  jobTitle: string;
  location: string | null;
  salary: string | null;
  status: BackendApplicationStatus;
  notes: string | null;

  jobDescription: string | null;
  requiredSkills: string | null;
  benefits: string | null;
  recruiter: string | null;
  applicationDeadline: string | null;

  createdAt: string;
  updatedAt: string;
};

type BackendApplicationRequest = {
  jobUrl: string;
  company: string;
  jobTitle: string;
  location: string;
  salary: string;
  status: BackendApplicationStatus;
  notes: string;

  jobDescription: string;
  requiredSkills: string;
  benefits: string;
  recruiter: string;
  applicationDeadline: string;
};

const frontendStatusMap: Record<
  BackendApplicationStatus,
  ApplicationStatus
> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

const backendStatusMap: Record<
  ApplicationStatus,
  BackendApplicationStatus
> = {
  Saved: "SAVED",
  Applied: "APPLIED",
  Assessment: "ASSESSMENT",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Rejected: "REJECTED",
};

function mapBackendApplication(
  application: BackendJobApplication
): JobApplication {
  return {
    id: application.id,
    jobUrl: application.jobUrl ?? "",
    company: application.company,
    jobTitle: application.jobTitle,
    location: application.location ?? "",
    salary: application.salary ?? "",
    status: frontendStatusMap[application.status],
    notes: application.notes ?? "",

    jobDescription: application.jobDescription ?? "",
    requiredSkills: application.requiredSkills ?? "",
    benefits: application.benefits ?? "",
    recruiter: application.recruiter ?? "",
    applicationDeadline: application.applicationDeadline ?? "",

    createdAt: application.createdAt,
  };
}

function mapApplicationRequest(
  application: ApplicationFormValues
): BackendApplicationRequest {
  return {
    jobUrl: application.jobUrl,
    company: application.company,
    jobTitle: application.jobTitle,
    location: application.location,
    salary: application.salary,
    status: backendStatusMap[application.status],
    notes: application.notes,

    jobDescription: application.jobDescription,
    requiredSkills: application.requiredSkills,
    benefits: application.benefits,
    recruiter: application.recruiter,
    applicationDeadline: application.applicationDeadline,
  };
}

export async function getApplications(): Promise<JobApplication[]> {
  const applications = await apiRequest<BackendJobApplication[]>(
    "/api/v1/applications"
  );

  return applications.map(mapBackendApplication);
}

export async function getApplicationById(
  id: string
): Promise<JobApplication | null> {
  try {
    const application = await apiRequest<BackendJobApplication>(
      `/api/v1/applications/${id}`
    );

    return mapBackendApplication(application);
  } catch (error) {
    console.error(`Unable to load application ${id}:`, error);
    return null;
  }
}

export async function saveApplication(
  application: ApplicationFormValues
): Promise<JobApplication> {
  const createdApplication =
    await apiRequest<BackendJobApplication>(
      "/api/v1/applications",
      {
        method: "POST",
        body: mapApplicationRequest(application),
      }
    );

  return mapBackendApplication(createdApplication);
}

export async function updateApplication(
  id: string,
  updates: ApplicationFormValues
): Promise<JobApplication> {
  const updatedApplication =
    await apiRequest<BackendJobApplication>(
      `/api/v1/applications/${id}`,
      {
        method: "PUT",
        body: mapApplicationRequest(updates),
      }
    );

  return mapBackendApplication(updatedApplication);
}

export async function deleteApplication(
  id: string
): Promise<void> {
  await apiRequest<void>(
    `/api/v1/applications/${id}`,
    {
      method: "DELETE",
    }
  );
}