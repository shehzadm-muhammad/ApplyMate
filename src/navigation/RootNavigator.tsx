import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import RegisterScreen from "../screens/RegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import MainTabNavigator from "./MainTabNavigator";
import ApplicationDetailsScreen from "../screens/ApplicationDetailsScreen";
import EditApplicationScreen from "../screens/EditApplicationScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import type { RootStackParamList } from "./types";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user,
          pendingVerification,
          isBootstrapping,
          } = useAuth();

  if (isBootstrapping) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
     initialRouteName={
        user
          ? "MainApp"
          : pendingVerification
            ? "VerifyEmail"
            : "Splash"
      }
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="MainApp"
            component={MainTabNavigator}
          />

          <Stack.Screen
            name="ApplicationDetails"
            component={ApplicationDetailsScreen}
            options={{
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
              headerBackTitle: "Applications",
            }}
          />

          <Stack.Screen
            name="EditApplication"
            component={EditApplicationScreen}
            options={{
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
              headerBackTitle: "Details",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
          />

          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
              headerBackTitle: "Back",
            }}
          />

          <Stack.Screen
            name="VerifyEmail"
            component={VerifyEmailScreen}
            options={{
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: true,
              headerTitle: "",
              headerShadowVisible: false,
              headerBackTitle: "Back",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}