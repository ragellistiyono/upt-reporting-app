import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} antialiased bg-gray-100 text-gray-800`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
