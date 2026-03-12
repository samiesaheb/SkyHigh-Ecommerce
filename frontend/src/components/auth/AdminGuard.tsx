"use client";

import { useUser } from "./UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/account/login?next=/admin/analytics");
      } else if (!user.is_admin) {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}