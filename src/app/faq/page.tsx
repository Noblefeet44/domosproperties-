import type { Metadata } from "next";
import { FAQPageClient } from "../components/FAQPageClient";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | DOMOS PROPERTY",
  description: "Find answers to common questions regarding student hostel bookings, inspection fees, legal agreements, and rental process in Ekpoma.",
  keywords: [
    "DOMOS PROPERTY FAQ",
    "hostel booking questions Ekpoma",
    "AAU student rent process",
    "Ekpoma hostel inspection fees",
  ],
  alternates: {
    canonical: "https://domosproperty.org/faq",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | DOMOS PROPERTY",
    description: "Find answers to common questions regarding student hostel bookings, inspection fees, legal agreements, and rental process in Ekpoma.",
    url: "https://domosproperty.org/faq",
    siteName: "DOMOS PROPERTY GLOBAL LIMITED",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/images/ehis_hostel.png",
        width: 1200,
        height: 630,
        alt: "DOMOS PROPERTY FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions (FAQ) | DOMOS PROPERTY",
    description: "Find answers to common questions regarding student hostel bookings, inspection fees, legal agreements, and rental process in Ekpoma.",
    images: ["/images/ehis_hostel.png"],
  },
};

export default function FAQPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I inspect a hostel or apartment in Ekpoma?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can click on any property listing to view photos, amenities, and click 'Make Inquiry' or contact our verified agent on WhatsApp directly to schedule a physical or virtual inspection.",
        },
      },
      {
        "@type": "Question",
        name: "Where are DOMOS PROPERTY hostels located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our verified student hostels and executive lodges are strategically located across Ekpoma near Ambrose Alli University (AAU), including AAU Main Gate, Ujoelen, University Road, Ihumudumu, and Market Square.",
        },
      },
      {
        "@type": "Question",
        name: "What fees are required when renting a property?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each property page transparently lists the annual/session rent along with any applicable caution fee, agency fee, legal agreement fee, and inspection fee.",
        },
      },
    ],
  };

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
        name: "FAQ",
        item: "https://domosproperty.org/faq",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FAQPageClient />
    </>
  );
}
