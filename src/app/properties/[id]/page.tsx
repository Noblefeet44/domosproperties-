import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "../../components/Navbar";
import YouTubePlayer from "../../components/YouTubePlayer";
import { getAllProperties, getPropertyBySlugOrId } from "@/lib/properties";
import { getPropertySlug } from "@/lib/slug";
import { getListingCardMedia } from "@/lib/youtube";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600; // Hourly ISR revalidation

export async function generateStaticParams() {
  const properties = await getAllProperties();
  return properties.map((property) => ({
    id: getPropertySlug(property),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyBySlugOrId(id);

  if (!property) {
    return {
      title: "Hostel Listing Not Found | DOMOS PROPERTY GLOBAL LIMITED",
      description: "The requested property listing could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cleanSlug = getPropertySlug(property);
  const canonicalUrl = `https://domosproperty.org/properties/${cleanSlug}`;
  const title = `${property.title} - Hostel & Rental in ${property.location} | DOMOS PROPERTY`;
  const description = property.description ? property.description.slice(0, 160) : `Book ${property.title} in ${property.neighborhood}, ${property.location}. Verified student accommodation near AAU Ekpoma.`;
  const mainImage = property.images && property.images.length > 0 ? property.images[0] : "/images/ehis_hostel.png";

  return {
    title,
    description,
    keywords: [
      property.title,
      property.neighborhood,
      property.location,
      "Ekpoma hostel",
      "AAU accommodation",
      "student lodge Ekpoma",
      "rentals Ekpoma",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "DOMOS PROPERTY GLOBAL LIMITED",
      locale: "en_NG",
      type: "article",
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [mainImage],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getPropertyBySlugOrId(id);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-5xl mb-4">🏚️</span>
          <h1 className="text-2xl font-bold mb-2">Residence Listing Not Found</h1>
          <p className="text-xs text-stone-500 max-w-sm mb-6">
            The property listing you are looking for may have been unlisted or moved.
          </p>
          <a
            href="/"
            className="px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 font-bold text-xs shadow-md"
          >
            Back to All Residences
          </a>
        </main>
      </div>
    );
  }

  const allProps = await getAllProperties();
  const similarProperties = allProps.filter((p) => p.id !== property.id).slice(0, 3);
  const cleanSlug = getPropertySlug(property);
  const canonicalUrl = `https://domosproperty.org/properties/${cleanSlug}`;
  const cardMedia = getListingCardMedia(property, "/images/ehis_hostel.png");
  const mainImage = cardMedia.imageUrl;

  const totalFees =
    (property.cautionFee || 0) +
    (property.reservationFee || 0) +
    (property.agencyFee || 0) +
    (property.inspectionFee || 0) +
    (property.legalFee || 0);
  const totalPackage = property.price + totalFees;

  // JSON-LD Structured Data
  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${canonicalUrl}#listing`,
    name: property.title,
    description: property.description,
    url: canonicalUrl,
    image: property.images && property.images.length > 0 ? property.images : [mainImage],
    datePosted: property.createdAt || new Date().toISOString(),
    itemOffered: {
      "@type": ["Residence", property.bedrooms > 1 ? "Apartment" : "SingleFamilyResidence"],
      name: property.title,
      description: property.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.neighborhood,
        addressLocality: "Ekpoma",
        addressRegion: "Edo State",
        addressCountry: "NG",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 6.7444,
        longitude: 6.0792,
      },
      numberOfBedrooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      occupancy: {
        "@type": "QuantitativeValue",
        value: property.guests,
      },
      amenityFeature: property.amenities.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
        value: true,
      })),
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      seller: {
        "@type": "RealEstateAgent",
        name: "DOMOS PROPERTY GLOBAL LIMITED",
        telephone: property.agentPhone || "+2347073537007",
        email: "domospropertygloballimited@gmail.com",
      },
    },
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
        name: "Properties",
        item: "https://domosproperty.org/#properties",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/"
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 flex items-center gap-1.5"
          >
            ← Back to Explore
          </a>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {property.neighborhood}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-2">{property.title}</h1>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-6">📍 {property.location}</p>

        {/* Core Web Vitals Optimized Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 rounded-2xl overflow-hidden shadow-md">
          <div className="md:col-span-2 h-72 sm:h-96 relative bg-stone-200 dark:bg-zinc-900">
            <Image
              src={mainImage}
              alt={property.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
              unoptimized={mainImage.includes("img.youtube.com")}
            />
          </div>
          <div className="hidden md:flex flex-col gap-4 h-96">
            {property.images.slice(1, 3).map((img, idx) => (
              <div key={idx} className="relative w-full h-[calc(50%-8px)] rounded-xl overflow-hidden bg-stone-200 dark:bg-zinc-900">
                <Image
                  src={img}
                  alt={`${property.title} photo ${idx + 2}`}
                  fill
                  loading="lazy"
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            {(property.youtubeVideoId || property.youtubeUrl) && (
              <div className="glass p-6 rounded-2xl border border-stone-200/50 dark:border-zinc-800/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-zinc-100 uppercase tracking-wider">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Property Video Tour</span>
                </div>
                <YouTubePlayer
                  videoId={property.youtubeVideoId}
                  url={property.youtubeUrl}
                  thumbnailUrl={property.youtubeThumbnail}
                  title={property.title}
                />
              </div>
            )}

            <div className="glass p-6 rounded-2xl border border-stone-200/50 dark:border-zinc-800/50">
              <h2 className="text-sm font-bold uppercase text-stone-400 tracking-wider mb-3">About this Residence</h2>
              <p className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-zinc-300">
                {property.description}
              </p>
            </div>

            <div className="glass p-6 rounded-2xl border border-stone-200/50 dark:border-zinc-800/50">
              <h2 className="text-sm font-bold uppercase text-stone-400 tracking-wider mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-stone-700 dark:text-zinc-300">
                    <span className="text-amber-500">✦</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="glass p-6 rounded-2xl border border-stone-200/50 dark:border-zinc-800/50 sticky top-24 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                  Annual / Session Rent
                </span>
                <p className="text-3xl font-black text-stone-900 dark:text-zinc-50">
                  ₦{property.price.toLocaleString()} <span className="text-xs font-semibold text-stone-400">/ session</span>
                </p>
                {totalFees > 0 && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 block font-extrabold mt-1">
                    Total Package with Fees: ₦{totalPackage.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100 dark:border-zinc-800 text-xs">
                {property.legalFee !== undefined && property.legalFee > 0 && (
                  <div className="flex justify-between text-purple-600 dark:text-purple-400">
                    <span>📜 Legal Fee:</span>
                    <span className="font-bold">₦{property.legalFee.toLocaleString()}</span>
                  </div>
                )}
                {property.inspectionFee !== undefined && property.inspectionFee > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>🔎 Inspection Fee:</span>
                    <span className="font-bold">₦{property.inspectionFee.toLocaleString()}</span>
                  </div>
                )}
                {property.agencyFee !== undefined && property.agencyFee > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>🤝 Agency Fee:</span>
                    <span className="font-bold">₦{property.agencyFee.toLocaleString()}</span>
                  </div>
                )}
                {property.cautionFee !== undefined && property.cautionFee > 0 && (
                  <div className="flex justify-between text-sky-600 dark:text-sky-400">
                    <span>🛡️ Caution Fee:</span>
                    <span className="font-bold">₦{property.cautionFee.toLocaleString()}</span>
                  </div>
                )}
                {property.reservationFee !== undefined && property.reservationFee > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>📌 Reservation Deposit:</span>
                    <span className="font-bold">₦{property.reservationFee.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <a
                href={`/?property=${property.id}`}
                className="block text-center w-full py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-amber-500 hover:text-white font-bold text-xs shadow-md transition-colors"
              >
                Make Inquiry
              </a>
            </div>
          </div>
        </div>

        {/* Similar Properties Section with Clean URLs */}
        {similarProperties.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200/50 dark:border-zinc-800/50">
            <h2 className="text-xl font-black mb-1">Similar Residences You Might Like</h2>
            <p className="text-xs text-stone-500 mb-6">Compare other managed listings in nearby locations</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {similarProperties.map((simProp) => {
                const simSlug = getPropertySlug(simProp);
                const simImg = simProp.images && simProp.images.length > 0 ? simProp.images[0] : "/images/ehis_hostel.png";

                return (
                  <a
                    key={simProp.id}
                    href={`/properties/${simSlug}`}
                    className="group glass rounded-2xl overflow-hidden border border-stone-200/50 dark:border-zinc-800/50 hover:border-amber-500/60 transition-all flex flex-col"
                  >
                    <div className="h-40 w-full overflow-hidden relative bg-stone-200 dark:bg-zinc-900">
                      <Image
                        src={simImg}
                        alt={simProp.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full z-10">
                        {simProp.neighborhood}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-sm font-bold truncate mb-1">{simProp.title}</h3>
                      <p className="text-xs text-stone-500 mb-3 truncate">📍 {simProp.location}</p>
                      <div className="mt-auto flex items-center justify-between border-t border-stone-100 dark:border-zinc-800/60 pt-3 text-xs">
                        <span className="font-extrabold text-stone-900 dark:text-zinc-50">
                          ₦{simProp.price.toLocaleString()} / session
                        </span>
                        <span className="text-xs font-bold text-amber-500 group-hover:underline">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
