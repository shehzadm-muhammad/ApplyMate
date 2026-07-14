import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RegisterScreen from "../screens/RegisterScreen";
import LoginScreen from "../screens/LoginScreen";
import SplashScreen from "../screens/SplashScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import type { RootStackParamList } from "./types";
import { colors } from "../theme/colors";
import MainTabNavigator from "./MainTabNavigator";
import ApplicationDetailsScreen from "../screens/ApplicationDetailsScreen";
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

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
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: true,
          headerTitle: "",
          headerShadowVisible: false,
          headerBackTitle: "Back",
        }}
      />
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
    </Stack.Navigator>
  );
}