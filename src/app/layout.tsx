import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";

export const metadata: Metadata = {
  title: "DOMOS PROPERTY GLOBAL LIMITED | Premium Student Hostels & Rentals in Ekpoma",
  description: "Discover verified student hostels and executive rental accommodations in Ekpoma, Edo State near Ambrose Alli University (AAU).",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
