import type { ApplicationStatus } from "../services/applicationStorage";

export type MainTabParamList = {
  Home: undefined;

  Applications:
    | {
        initialStatus?: ApplicationStatus;
      }
    | undefined;

  AddApplication: undefined;
  Reminders: undefined;
  Profile: undefined;
};