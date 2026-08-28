import type {
  NavigatorScreenParams,
} from "@react-navigation/native";

import type {
  MainTabParamList,
} from "./mainTabTypes";

export type RootStackParamList = {
  Splash: undefined;

  Welcome: undefined;

  Register: undefined;

  VerifyEmail:
    | {
        email?: string;
      }
    | undefined;

  Login:
    | {
        registeredEmail?: string;
        passwordReset?: boolean;
      }
    | undefined;

  ForgotPassword:
    | {
        email?: string;
      }
    | undefined;

  ResetPassword: {
    email: string;
  };

  MainApp:
    | NavigatorScreenParams<MainTabParamList>
    | undefined;

  EmailSuggestions:
    | {
        suggestionId?: string;
        selectedApplicationId?: string;
      }
    | undefined;

  ApplicationDetails: {
    applicationId: string;
  };

  EditApplication: {
    applicationId: string;
  };
};