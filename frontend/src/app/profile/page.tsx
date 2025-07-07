"use client";

import { useEffect, useState } from "react";
import { Loader2, UserCircle } from "lucide-react";

type User = {
  username?: string;
  full_name: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/account/user/", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();

        // ✅ Set user even if username is missing
        setUser({
          username: data.email,
          full_name:
            data.full_name || `${data.first_name} ${data.last_name || ""}`.trim(),
          email: data.email,
        });
      } catch (err) {
        console.warn("User is not authenticated.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-red-500" />
        <span className="ml-2 text-gray-700">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        <p className="text-lg">You are not logged in.</p>
        <a href="/account/login" className="text-blue-600 underline font-medium">
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 px-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        <div className="flex items-center mb-6">
          <UserCircle className="w-12 h-12 text-red-500 mr-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.full_name}
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500 text-sm">Full Name</p>
            <p className="text-gray-900 font-medium">{user.full_name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Username</p>
            <p className="text-gray-900 font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="text-gray-900 font-medium">{user.email || "N/A"}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/profile/edit"
            className="inline-block text-center px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Edit Profile
          </a>
          <a
            href="/profile/orders"
            className="inline-block text-center px-6 py-2 rounded-lg border border-red-600 text-red-600 font-medium hover:bg-red-50 transition"
          >
            View Order History
          </a>
        </div>
      </div>
    </div>
  );
}
