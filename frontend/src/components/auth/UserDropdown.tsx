"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogOut, Settings, UserCircle2, BarChart3 } from "lucide-react";
import { useUser } from "@/components/auth/UserContext";
import { API_ENDPOINTS } from "@/lib/config";

interface UserDropdownProps {
  onError: (error: string) => void;
}

export default function UserDropdown({ onError }: UserDropdownProps) {
  const { user, setUser = () => {} } = useUser() || {};
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setShowUserDropdown(false);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      onError("Failed to log out");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    return words.length === 1
      ? words[0].substring(0, 2).toUpperCase()
      : (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setShowUserDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowUserDropdown(!showUserDropdown)}
        className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 text-neutral-700 transition-all duration-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-1 touch-manipulation"
        aria-label="User menu"
      >
        {user ? (
          <div
            aria-hidden="true"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white font-medium text-sm select-none transition-transform hover:scale-105"
            title={user.full_name || user.username || "User"}
          >
            {getInitials(user.full_name || user.username || "")}
          </div>
        ) : (
          <User className="w-5 h-5" />
        )}
      </button>

      {showUserDropdown && (
        <div className="absolute right-0 mt-3 w-56 bg-white shadow-lg rounded-lg z-50 border border-neutral-100 overflow-hidden max-w-[calc(100vw-2rem)]">
          {user ? (
            <>
              {/* User Info Header */}
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-white font-medium text-xs">
                    {getInitials(user.full_name || user.username || "")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {user.full_name?.trim() || user.username || "User"}
                    </p>
                    {user.email && (
                      <p className="text-xs text-neutral-500 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <UserCircle2 className="w-4 h-4" />
                  Profile
                </Link>
                
                {/* Admin Section */}
                {user.is_admin && (
                  <>
                    <div className="border-t border-neutral-100 my-2"></div>
                    <div className="px-4 py-1">
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Admin</p>
                    </div>
                    <Link
                      href="/admin/analytics"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Business Intelligence Dashboard
                    </Link>
                  </>
                )}
                
                <div className="border-t border-neutral-100 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="py-2">
              <Link
                href="/account/login"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/account/signup"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}