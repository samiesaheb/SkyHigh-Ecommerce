// src/components/UserContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { API_ENDPOINTS } from "@/lib/config";
import { User, UserContextType } from "@/types";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const memoizedSetUser = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      await fetch(API_ENDPOINTS.CSRF, { credentials: "include" });
      const res = await fetch(API_ENDPOINTS.AUTH.USER, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      setUser({
        username: data.email,
        full_name: `${data.first_name}${data.last_name ? " " + data.last_name : ""}`,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        is_admin: data.is_admin,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser: memoizedSetUser,
      loading,
      refreshUser,
    }),
    [user, memoizedSetUser, loading, refreshUser]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
