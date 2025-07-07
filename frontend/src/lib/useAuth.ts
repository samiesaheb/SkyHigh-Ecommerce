// src/lib/useAuth.ts
"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/user/", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser({ username: data.username });
        }
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
