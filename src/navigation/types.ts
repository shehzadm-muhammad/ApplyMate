export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Register: undefined;

  Login:
    | {
        registeredEmail?: string;
      }
    | undefined;

  MainApp: undefined;

  ApplicationDetails: {
    applicationId: string;
  };

  EditApplication: {
    applicationId: string;
  };
};