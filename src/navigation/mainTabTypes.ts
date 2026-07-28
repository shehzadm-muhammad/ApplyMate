import type { ApplicationStatus } from "../services/applicationService";

export type MainTabParamList = {
  Home: undefined;

  Applications:
    | {
        initialStatus?: ApplicationStatus;
        resetKey?: number;
      }
    | undefined;

  AddApplication: undefined;
  Reminders: undefined;
  Profile: undefined;
};