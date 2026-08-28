import type {
  ApplicationStatus,
} from "../services/applicationService";

export type MainTabParamList = {
  Home: undefined;

  Applications:
    | {
        initialStatus?: ApplicationStatus;
        resetKey?: number;
      }
    | undefined;

  AddApplication:
    | {
        sourceEmailSuggestionId?: string;
        initialCompany?: string;
        initialJobTitle?: string;
        initialStatus?: ApplicationStatus;
      }
    | undefined;

  Reminders: undefined;

  Profile: undefined;
};