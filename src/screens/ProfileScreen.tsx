import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import SettingsRow from "../components/SettingsRow";
import StatCard from "../components/StatCard";
import type { MainTabParamList } from "../navigation/mainTabTypes";
import type { RootStackParamList } from "../navigation/types";
import {
  getApplications,
  type JobApplication,
} from "../services/applicationService";
import { useAuth } from "../context/AuthContext";
import {
  getSettings,
  saveSettings,
  type AppSettings,
} from "../services/settingsStorage";
import { colors } from "../theme/colors";

import type { GmailConnection } from "../types/emailIntegration";

import {
  connectGmail,
  disconnectGmail,
  GmailAuthorizationError,
} from "../services/gmailAuthService";

import {
  getGmailConnection,
} from "../services/gmailConnectionStorage";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({
  navigation,
}: Props) {
  const { user, signOut, deleteAccount } = useAuth();
  const [applications, setApplications] = useState<
    JobApplication[]
  >([]);

  const [
    gmailConnection,
    setGmailConnection,
  ] = useState<GmailConnection | null>(null);

  const [gmailBusy, setGmailBusy] =
    useState(false);

  const [settings, setSettings] = useState<AppSettings>({
    notificationsEnabled: true,
    faceIdEnabled: false,
  });

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const [
          storedApplications,
          storedSettings,
          storedGmailConnection,
        ] = await Promise.all([
          getApplications(),
          getSettings(),
          user
            ? getGmailConnection(user.id)
            : Promise.resolve(null),
        ]);

        setApplications(storedApplications);
        setSettings(storedSettings);
        setGmailConnection(
          storedGmailConnection,
        );
      };

      void loadProfile();
    }, [user?.id])
  );

  const interviewCount = applications.filter(
    (application) => application.status === "Interview"
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "Offer"
  ).length;

  const updateSettings = async (
    updates: Partial<AppSettings>
  ) => {
    const updatedSettings = {
      ...settings,
      ...updates,
    };

    setSettings(updatedSettings);
    await saveSettings(updatedSettings);
  };

  const maskEmail = (email: string): string => {
    const [localPart, domain] =
      email.split("@");

    if (!localPart || !domain) {
      return email;
    }

    const firstCharacter =
      localPart.charAt(0);

    return `${firstCharacter}***@${domain}`;
  };

  const performConnectGmail = async () => {
    if (!user || gmailBusy) {
      return;
    }

    setGmailBusy(true);

    try {
      const connection =
        await connectGmail(user.id);

      setGmailConnection(connection);

      Alert.alert(
        "Gmail connected",
        `Connected as ${maskEmail(
          connection.googleEmail,
        )}.`,
      );
    } catch (error) {
      if (error instanceof GmailAuthorizationError) {
        if (error.code === "CANCELLED") {
          return;
        }

        if (error.code === "ACCOUNT_ALREADY_CONNECTED") {
          Alert.alert(
            "Gmail already connected",
            "This Gmail account is already connected to another ApplyMate account on this device. Disconnect it from that ApplyMate account before connecting it here.",
          );

          return;
        }
      }

      Alert.alert(
        "Couldn't connect Gmail",
        "Google authorization did not complete. Please try again.",
      );
    } finally {
      setGmailBusy(false);
    }
  };

  const performDisconnectGmail = async () => {
    if (!user || gmailBusy) {
      return;
    }

    setGmailBusy(true);

    try {
      const result =
        await disconnectGmail(user.id);

      setGmailConnection(null);

      if (
        result.providerRevocationConfirmed
      ) {
        Alert.alert(
          "Gmail disconnected",
          "ApplyMate no longer has access to this Gmail account.",
        );
      } else {
        Alert.alert(
          "Gmail disconnected",
          "The connection was removed from ApplyMate, but Google access revocation could not be confirmed. You can also remove ApplyMate from your Google Account permissions.",
        );
      }
    } catch {
      Alert.alert(
        "Couldn't disconnect Gmail",
        "The Gmail connection could not be removed safely. Please try again.",
      );
    } finally {
      setGmailBusy(false);
    }
  };

  const handleGmail = () => {
    if (gmailBusy) {
      return;
    }

    if (!gmailConnection) {
      void performConnectGmail();
      return;
    }

    Alert.alert(
      "Disconnect Gmail?",
      "ApplyMate will stop using this Gmail connection. Your saved applications will not be deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            void performDisconnectGmail();
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      settings,
      applications,
    };

    await Share.share({
      title: "ApplyMate data export",
      message: JSON.stringify(exportData, null, 2),
    });
  };

  const performLogout = async () => {
    await signOut();
  };

  const handleLogout = () => {
    Alert.alert(
      "Log out of ApplyMate?",
      "You can log back in to continue managing your applications.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            void performLogout();
          },
        },
      ]
    );
  };

  const performDeleteAccount = async () => {
    try {
      await deleteAccount();
    } catch {
      Alert.alert(
        "Couldn't delete account",
        "Your account was not deleted. Please check your connection and try again."
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete your ApplyMate account?",
      "This permanently deletes your account, applications and reminders. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Permanently delete account?",
              "All of your ApplyMate account data will be permanently deleted.",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete Account",
                  style: "destructive",
                  onPress: () => {
                    void performDeleteAccount();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = async () => {
  await Linking.openURL(
    "https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html"
  );
};

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "ApplyMate user";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0).toUpperCase() ?? "A"}
            </Text>
          </View>

          <View style={styles.profileInformation}>
            <Text style={styles.name}>{fullName}</Text>

            <Text style={styles.email}>
              {user?.email ?? "No email saved"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your progress</Text>

        <View style={styles.statsGrid}>
          <StatCard
            title="Applications"
            value={applications.length}
            onPress={() => navigation.navigate("Applications")}
          />

          <StatCard
            title="Interviews"
            value={interviewCount}
            onPress={() =>
              navigation.navigate("Applications", {
                initialStatus: "Interview",
              })
            }
          />

          <StatCard
            title="Offers"
            value={offerCount}
            onPress={() =>
              navigation.navigate("Applications", {
                initialStatus: "Offer",
              })
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingsCard}>
          <SettingsRow
            icon="notifications-outline"
            title="Notifications"
            description="Receive reminders about applications and interviews."
            value={settings.notificationsEnabled}
            onValueChange={(value) => {
              void updateSettings({
                notificationsEnabled: value,
              });
            }}
          />

          <SettingsRow
            icon="finger-print-outline"
            title="Face ID"
            description="The secure login connection will be added with authentication."
            value={settings.faceIdEnabled}
            onValueChange={(value) => {
              void updateSettings({
                faceIdEnabled: value,
              });
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Email integration
        </Text>

        <View style={styles.settingsCard}>
          <SettingsRow
            icon="mail-outline"
            title={
              gmailBusy
                ? "Working..."
                : gmailConnection
                  ? "Gmail connected"
                  : "Connect Gmail"
            }
            description={
              gmailConnection
                ? `Connected as ${maskEmail(
                    gmailConnection.googleEmail,
                  )}. Tap to disconnect.`
                : "Connect Gmail to check for recruitment-related application updates."
            }
            onPress={
              gmailBusy
                ? undefined
                : handleGmail
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Data and account</Text>

        <View style={styles.settingsCard}>
          <SettingsRow
            icon="download-outline"
            title="Export ApplyMate data"
            description="Share a copy of your locally stored account and application data."
            onPress={() => {
              void handleExportData();
            }}
          />

          <SettingsRow
            icon="document-text-outline"
            title="Privacy Policy"
            description="Read how ApplyMate handles your information."
            onPress={() => {
              void handlePrivacyPolicy();
            }}
          />

          <SettingsRow
            icon="trash-outline"
            title="Delete Account"
            description="Permanently delete your account and ApplyMate data."
            destructive
            onPress={handleDeleteAccount}
          />

          <SettingsRow
            icon="log-out-outline"
            title="Log Out"
            description="Return to the ApplyMate welcome screen."
            destructive
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.versionText}>
          ApplyMate MVP · Version 0.7
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },

  heading: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  avatar: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    backgroundColor: colors.primary,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  profileInformation: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "700",
  },

  email: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 14,
  },

  sectionTitle: {
    marginTop: 30,
    marginBottom: 14,
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "700",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  settingsCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.background,
  },

  versionText: {
    marginTop: 28,
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
});