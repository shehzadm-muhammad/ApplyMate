import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  CurrentUserResponse,
  LoginRequest,
} from "../types/api";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from "../services/authService";

import { setSessionExpiredHandler } from "../services/sessionEvents";
import { deleteAccount as deleteAccountService } from "../services/accountService";
import {
  getAccessToken,
  getRefreshToken,
} from "../services/tokenStorage";

interface AuthContextValue {
  user: CurrentUserResponse | null;
  isBootstrapping: boolean;
  signIn: (request: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<CurrentUserResponse | null>(null);

  const [isBootstrapping, setIsBootstrapping] =
    useState(true);

  useEffect(() => {
    return setSessionExpiredHandler(() => {
      setUser(null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          getAccessToken(),
          getRefreshToken(),
        ]);

        if (!accessToken && !refreshToken) {
          return;
        }

        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        /*
         * The API client removes genuinely invalid sessions.
         * Keep stored tokens during temporary connection or server
         * failures so restoration can be attempted again later.
         */
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(request: LoginRequest): Promise<void> {
    console.log("AUTH: signIn started", request.email);

    try {
      const loginResponse = await loginUser(request);

      console.log(
        "AUTH: login successful",
        loginResponse.email,
      );

      const token = await getAccessToken();

      console.log(
        "AUTH: token stored",
        token ? "YES" : "NO",
      );

      const currentUser = await getCurrentUser();

      console.log(
        "AUTH: current user loaded",
        currentUser,
      );

      setUser(currentUser);

      console.log("AUTH: user state updated");
    } catch (error) {
      console.error("AUTH: signIn failed", error);

      await logoutUser();
      setUser(null);

      throw error;
    }
  }

  async function signOut(): Promise<void> {
    await logoutUser();
    setUser(null);
  }

  async function deleteAccount(): Promise<void> {
    if (!user) {
      return;
    }

    const userId = user.id;

    await deleteAccountService(userId);
    setUser(null);
  }

  async function refreshUser(): Promise<void> {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isBootstrapping,
      signIn,
      signOut,
      deleteAccount,
      refreshUser,
    }),
    [user, isBootstrapping],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}