import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context/AppContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://domosproperty.org"),
  title: {
    default: "DOMOS PROPERTY GLOBAL LIMITED | Premium Student Hostels & Rentals in Ekpoma",
    template: "%s | DOMOS PROPERTY GLOBAL LIMITED",
  },
  description: "Discover verified student hostels, lodges, and executive rental accommodations in Ekpoma, Edo State near Ambrose Alli University (AAU). Book directly with verified agents.",
  keywords: [
    "DOMOS PROPERTY",
    "DOMOS PROPERTY GLOBAL LIMITED",
    "student hostels Ekpoma",
    "AAU lodges",
    "Ambrose Alli University hostels",
    "student accommodation Ekpoma",
    "Edo State real estate",
    "rentals Ekpoma",
    "apartments in Ekpoma",
    "shortlet Ekpoma",
  ],
  authors: [{ name: "DOMOS PROPERTY GLOBAL LIMITED" }],
  creator: "DOMOS PROPERTY GLOBAL LIMITED",
  publisher: "DOMOS PROPERTY GLOBAL LIMITED",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://domosproperty.org",
    siteName: "DOMOS PROPERTY GLOBAL LIMITED",
    title: "DOMOS PROPERTY GLOBAL LIMITED | Premium Student Hostels & Rentals in Ekpoma",
    description: "Discover verified student hostels, lodges, and executive rental accommodations in Ekpoma, Edo State near Ambrose Alli University (AAU).",
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
    description: "Discover verified student hostels, lodges, and executive rental accommodations in Ekpoma, Edo State near Ambrose Alli University (AAU).",
    images: ["/images/ehis_hostel.png"],
  },
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
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://domosproperty.org/#organization",
    name: "DOMOS PROPERTY GLOBAL LIMITED",
    legalName: "DOMOS PROPERTY GLOBAL LIMITED",
    url: "https://domosproperty.org",
    logo: "https://domosproperty.org/icon.png",
    image: "https://domosproperty.org/images/ehis_hostel.png",
    description: "Verified student hostels, executive lodges, hotel suites, vehicle rentals, and land plots in Ekpoma, Edo State.",
    telephone: "+2347073537007",
    email: "domospropertygloballimited@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Suit 4, DOMOS Plaza, University Road",
      addressLocality: "Ekpoma",
      addressRegion: "Edo State",
      addressCountry: "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.7444,
      longitude: 6.0792,
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Ekpoma",
      },
      {
        "@type": "AdministrativeArea",
        name: "Edo State",
      },
    ],
    priceRange: "₦₦",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://domosproperty.org/#website",
    url: "https://domosproperty.org",
    name: "DOMOS PROPERTY GLOBAL LIMITED",
    description: "Premium Student Hostels & Rentals in Ekpoma, Edo State",
    publisher: {
      "@id": "https://domosproperty.org/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://domosproperty.org/?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`h-full antialiased ${jakarta.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
