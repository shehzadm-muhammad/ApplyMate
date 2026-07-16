import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AddApplicationScreen from "../screens/AddApplicationScreen";
import ApplicationsScreen from "../screens/ApplicationsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RemindersScreen from "../screens/RemindersScreen";
import { colors } from "../theme/colors";
import type { MainTabParamList } from "./mainTabTypes";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,

        tabBarStyle: {
          height: 84,
          paddingTop: 8,
          paddingBottom: 18,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarIcon: ({ color, size, focused }) => {
          let iconName:
            | "home"
            | "home-outline"
            | "briefcase"
            | "briefcase-outline"
            | "add-circle"
            | "add-circle-outline"
            | "notifications"
            | "notifications-outline"
            | "person"
            | "person-outline";

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;

            case "Applications":
              iconName = focused ? "briefcase" : "briefcase-outline";
              break;

            case "AddApplication":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;

            case "Reminders":
              iconName = focused
                ? "notifications"
                : "notifications-outline";
              break;

            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={route.name === "AddApplication" ? size + 8 : size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: "Home" }}
      />

        <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        listeners={({ navigation }) => ({
            tabPress: () => {
            navigation.setParams({
                initialStatus: undefined,
                resetKey: Date.now(),
            });
            },
        })}
        />

      <Tab.Screen
        name="AddApplication"
        component={AddApplicationScreen}
        options={{ tabBarLabel: "Add" }}
      />

      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}