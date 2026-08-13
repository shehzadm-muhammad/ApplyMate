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

  MainApp: undefined;

  ApplicationDetails: {
    applicationId: string;
  };

  EditApplication: {
    applicationId: string;
  };
};