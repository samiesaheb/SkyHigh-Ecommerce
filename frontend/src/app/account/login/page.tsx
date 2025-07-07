"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/account/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: email, // still "username" field expected by Django
          password,
        }),
      });

      if (response.ok) {
        alert("✅ Login successful!");
        router.push("/");
      } else {
        const errorText = await response.text();
        alert(`❌ Login failed: ${errorText}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("❌ Network error. Please try again later.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-black">Login</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full border px-3 py-2 rounded text-black"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 w-full border px-3 py-2 rounded text-black"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Login
        </button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-700">
            Don’t have an account?{" "}
            <a
              href="/account/signup"
              className="text-red-600 hover:underline font-medium"
            >
              Sign up
            </a>
          </span>
        </div>

        <div className="text-right mt-2">
          <a
            href="/forgot-password"
            className="text-sm text-red-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-4 text-sm text-gray-500">OR</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>

      {/* ✅ Google Login */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (tokenResponse) => {
            console.log("🔐 Google token response:", tokenResponse);

            try {
              const res = await fetch("http://localhost:8000/api/account/google-login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  id_token: tokenResponse.credential,
                }),
              });

              const text = await res.text();
              let errorJson: any = null;
              try {
                errorJson = JSON.parse(text);
              } catch {
                console.error("❌ Google login failed (non-JSON):", text);
              }

              if (res.ok) {
                alert("✅ Google login successful!");
                router.push("/");
              } else {
                console.error("Google login failed JSON:", errorJson);
                alert(
                  `❌ Google login failed: ${
                    errorJson?.detail ||
                    errorJson?.non_field_errors?.[0] ||
                    text ||
                    "Unknown error"
                  }`
                );
              }
            } catch (err) {
              console.error("Google login error:", err);
              alert("❌ Google login error.");
            }
          }}
          onError={() => alert("❌ Google login failed")}
          useOneTap={false}
        />
      </div>
    </div>
  );
}
