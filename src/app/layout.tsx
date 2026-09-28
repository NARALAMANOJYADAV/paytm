import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BroadcastBanner from "@/components/BroadcastBanner";
import MobileBottomNav from "@/components/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prompt to Production | Paytm AI Workshop – NBKRIST",
  description:
    "Official event platform for 'Prompt to Production' Paytm AI Workshop, organized by Department of IT & AI&DS, N.B.K.R. Institute of Science & Technology in association with ISTE. 30 September 2026.",
  keywords: [
    "Prompt to Production",
    "Paytm AI Workshop",
    "NBKRIST",
    "ISTE",
    "Generative AI",
    "Prompt Engineering",
    "AI Workshop 2026",
    "Vidyanagar",
  ],
  authors: [{ name: "NBKRIST IT & AI&DS" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
        <AuthProvider>
          <BroadcastBanner />
          <Navbar />
          <main className="flex-1 flex flex-col pb-16 lg:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
