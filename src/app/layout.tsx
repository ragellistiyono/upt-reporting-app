import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Pelaporan Kinerja UPT - PLN Indonesia",
  description: "Sistem Pelaporan Kinerja Unit Pelaksana Teknis PLN Indonesia",
  icons: {
    icon: "/favicon.ico",
  },
  // SEO optimizations
  robots: {
    index: false, // Prevent indexing for internal app
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} antialiased bg-gray-100 text-gray-800`}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
