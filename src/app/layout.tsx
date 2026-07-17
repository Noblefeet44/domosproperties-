import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abuja Shortlet | Premium Shortlets & Luxury Apartments in Abuja",
  description: "Book exclusive luxury short-stay apartments in Abuja&apos;s premium neighborhoods including Maitama, Asokoro, Wuse II, and Jabi Lake.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-50">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

