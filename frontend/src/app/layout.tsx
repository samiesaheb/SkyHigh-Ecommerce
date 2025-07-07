import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "./client-layout";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "151658094010-dge9cm30b4862fcjsfqigrufct3ontk1.apps.googleusercontent.com";

export const metadata: Metadata = {
  title: "Sky High",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-black">
        <GoogleOAuthProvider
          clientId={GOOGLE_CLIENT_ID}
          // ✅ Force English locale
          scriptSrc="https://accounts.google.com/gsi/client?hl=en"
        >
          <ClientLayout>{children}</ClientLayout>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
