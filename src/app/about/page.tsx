import type { Metadata } from "next";
import { AboutPageClient } from "../components/AboutPageClient";

export const metadata: Metadata = {
  title: "About Us | DOMOS PROPERTY GLOBAL LIMITED",
  description: "Learn about DOMOS PROPERTY GLOBAL LIMITED, Ekpoma's leading real estate and student housing platform near Ambrose Alli University (AAU).",
  keywords: [
    "About DOMOS PROPERTY",
    "Ekpoma real estate company",
    "AAU student housing platform",
    "DOMOS PROPERTY GLOBAL LIMITED",
  ],
  alternates: {
    canonical: "https://domosproperty.org/about",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "About Us | DOMOS PROPERTY GLOBAL LIMITED",
    description: "Learn about DOMOS PROPERTY GLOBAL LIMITED, Ekpoma's leading real estate and student housing platform near Ambrose Alli University (AAU).",
    url: "https://domosproperty.org/about",
    siteName: "DOMOS PROPERTY GLOBAL LIMITED",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/images/ehis_hostel.png",
        width: 1200,
        height: 630,
        alt: "About DOMOS PROPERTY GLOBAL LIMITED",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | DOMOS PROPERTY GLOBAL LIMITED",
    description: "Learn about DOMOS PROPERTY GLOBAL LIMITED, Ekpoma's leading real estate and student housing platform near Ambrose Alli University (AAU).",
    images: ["/images/ehis_hostel.png"],
  },
};

export default function AboutPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://domosproperty.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About Us",
        item: "https://domosproperty.org/about",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AboutPageClient />
    </>
  );
}
