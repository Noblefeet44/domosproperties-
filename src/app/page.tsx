import type { Metadata } from "next";
import { HomePageClient } from "./components/HomePageClient";

export const metadata: Metadata = {
  title: "DOMOS PROPERTY GLOBAL LIMITED | Premium Student Hostels & Rentals in Ekpoma",
  description: "Discover verified student hostels, executive lodges, and rental accommodations near Ambrose Alli University (AAU) in Ekpoma, Edo State.",
  keywords: [
    "DOMOS PROPERTY",
    "student hostels Ekpoma",
    "AAU lodges",
    "Ambrose Alli University hostels",
    "rentals Ekpoma",
    "student accommodation Ekpoma",
  ],
  alternates: {
    canonical: "https://domosproperty.org",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "DOMOS PROPERTY GLOBAL LIMITED | Premium Student Hostels & Rentals in Ekpoma",
    description: "Discover verified student hostels, executive lodges, and rental accommodations near Ambrose Alli University (AAU) in Ekpoma, Edo State.",
    url: "https://domosproperty.org",
    siteName: "DOMOS PROPERTY GLOBAL LIMITED",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/images/ehis_hostel.png",
        width: 1200,
        height: 630,
        alt: "DOMOS PROPERTY GLOBAL LIMITED",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DOMOS PROPERTY GLOBAL LIMITED | Premium Student Hostels & Rentals in Ekpoma",
    description: "Discover verified student hostels, executive lodges, and rental accommodations near Ambrose Alli University (AAU) in Ekpoma, Edo State.",
    images: ["/images/ehis_hostel.png"],
  },
};

export default function Home() {
  return <HomePageClient />;
}

