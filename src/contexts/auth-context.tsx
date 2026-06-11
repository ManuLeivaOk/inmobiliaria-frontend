"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth-api";
import { configureApiClient } from "@/lib/api/client";
import type { RegisterPayload } from "@/lib/api/auth-api";
import type { LoginPayload } from "@/lib/api/auth-api";
import type { User } from "@/lib/auth/types";
import { AUTH_ROUTES } from "@/lib/auth/constants";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessTokenRef = useRef<string | null>(null);
  const bootstrapDone = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setAccessToken = useCallback((token: string | null) => {
    accessTokenRef.current = token;
  }, []);

  const applyAuth = useCallback(
    (accessToken: string, nextUser: User) => {
      setAccessToken(accessToken);
      setUser(nextUser);
    },
    [setAccessToken],
  );

  const clearLocalSession = useCallback(async () => {
    bootstrapDone.current = false;
    setAccessToken(null);
    setUser(null);
    try {
      await authApi.clearSession();
    } catch {
      /* backend caído */
    }
  }, [setAccessToken]);

  /** Refresh silencioso para reintentos del api client. No borra la sesión si falla. */
  const silentRefresh = useCallback(async (): Promise<string | null> => {
    setIsRefreshing(true);
    try {
      const data = await authApi.refreshSession();
      applyAuth(data.accessToken, data.user);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [applyAuth]);

  const handleSessionExpired = useCallback(async () => {
    await clearLocalSession();
  }, [clearLocalSession]);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const token = await silentRefresh();
    if (!token) {
      await clearLocalSession();
    }
    return token;
  }, [silentRefresh, clearLocalSession]);

  // Configurar el cliente HTTP (solo cuando cambian los handlers)
  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessTokenRef.current,
      setAccessToken: (token) => {
        accessTokenRef.current = token;
      },
      refresh: silentRefresh,
      onSessionExpired: handleSessionExpired,
    });
  }, [silentRefresh, handleSessionExpired]);

  useEffect(() => {
    if (bootstrapDone.current) {
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      // 1. OBTENEMOS LA RUTA ACTUAL DE FORMA ESTÁTICA
      const currentPath = window.location.pathname;

      // 2. 🛑 EL CORTOCIRCUITO: Si el usuario ya está en /login o /register,
      // NO ejecutamos el refresh. Pasamos directo a terminar la carga.
      if (isAuthRoute(currentPath)) {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
          bootstrapDone.current = true;
          setIsLoading(false);
        }
        return; // <--- Frenamos la ejecución acá, no se hace el fetch
      }

      // 3. Si NO está en una ruta de auth (ej: está en /dashboard), intentamos el refresh
      setIsLoading(true);

      try {
        const token = await silentRefresh();

        if (!token) {
          if (!cancelled) {
            setUser(null);
            setAccessToken(null);
            router.replace("/login");
          }
          return;
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          bootstrapDone.current = true;
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [router, silentRefresh, setAccessToken]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await authApi.login(payload);
      applyAuth(data.accessToken, data.user);
      bootstrapDone.current = true;
      router.replace("/dashboard");
    },
    [applyAuth, router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await authApi.register(payload, accessTokenRef.current);
      applyAuth(data.accessToken, data.user);
      bootstrapDone.current = true;
      router.replace("/dashboard");
    },
    [applyAuth, router],
  );

  const logout = useCallback(async () => {
    try {
      if (!accessTokenRef.current) {
        await silentRefresh();
      }
      if (accessTokenRef.current) {
        await authApi.logout();
      }
    } catch {
      /* sesión ya inválida */
    } finally {
      await clearLocalSession();
      router.replace("/login");
    }
  }, [router, silentRefresh, clearLocalSession]);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      /* ignore */
    } finally {
      await clearLocalSession();
      router.replace("/login");
    }
  }, [router, clearLocalSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken: accessTokenRef.current,
      isLoading,
      isRefreshing,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      logoutAll,
      refreshSession,
    }),
    [
      user,
      isLoading,
      isRefreshing,
      login,
      register,
      logout,
      logoutAll,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
