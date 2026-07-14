import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "@applymate/session";
const USER_KEY = "@applymate/user";

export type StoredUser = {
  firstName: string;
  lastName: string;
  email: string;
};

export async function saveSession(user: StoredUser): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(SESSION_KEY, "authenticated"),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function getSession(): Promise<boolean> {
  const session = await AsyncStorage.getItem(SESSION_KEY);

  return session === "authenticated";
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const storedUser = await AsyncStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser) as StoredUser;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([SESSION_KEY, USER_KEY]);
}