import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@applymate/settings";

export type AppSettings = {
  notificationsEnabled: boolean;
  faceIdEnabled: boolean;
};

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  faceIdEnabled: false,
};

export async function getSettings(): Promise<AppSettings> {
  const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);

  if (!storedSettings) {
    return defaultSettings;
  }

  return {
    ...defaultSettings,
    ...(JSON.parse(storedSettings) as Partial<AppSettings>),
  };
}

export async function saveSettings(
  settings: AppSettings
): Promise<void> {
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );
}

export async function clearSettings(): Promise<void> {
  await AsyncStorage.removeItem(SETTINGS_KEY);
}