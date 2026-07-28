import { Metadata } from "next";
import { INITIAL_PROPERTIES, Property } from "../../data/properties";
import { Navbar } from "../../components/Navbar";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProperty(id: string): Promise<Property | null> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  // Try fetching directly from Airtable if configured
  if (apiKey && baseId) {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${baseId}/Properties/${id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const record = await res.json();
        const fields = record.fields || {};
        let images: string[] = [];
        if (Array.isArray(fields.images)) {
          images = fields.images.map((img: { url?: string }) => img.url || "");
        } else if (typeof fields.images === "string") {
          images = [fields.images];
        }

        return {
          id: record.id,
          title: fields.title || "Student Hostel & Lodge",
          description: fields.description || "",
          price: Number(fields.price) || 350000,
          location: fields.location || "Ekpoma, Edo State",
          neighborhood: fields.neighborhood || "AAU Main Gate",
          bedrooms: Number(fields.bedrooms) || 1,
          bathrooms: Number(fields.bathrooms) || 1,
          guests: Number(fields.guests) || 2,
          rating: 4.9,
          reviewsCount: 1,
          images: images.length > 0 ? images : ["/images/ehis_hostel.png"],
          amenities: Array.isArray(fields.amenities) ? fields.amenities : [],
          featured: fields.featured === true,
          reviews: [],
        };
      }
    } catch (e) {
      console.error("Airtable property fetch error for SEO page:", e);
    }
  }

  // Fallback to initial local properties array
  const found = INITIAL_PROPERTIES.find((p) => p.id === id);
  return found || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return {
      title: "Hostel Listing Not Found | DOMOS PROPERTY GLOBAL LIMITED",
      description: "The requested property listing could not be found.",
    };
  }

  const title = `${property.title} - Hostel & Lodging in ${property.location} | DOMOS PROPERTY`;
  const description = property.description.slice(0, 160);
  const imageUrl = property.images[0] || "/images/ehis_hostel.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, alt: property.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-5xl mb-4">🏚️</span>
          <h1 className="text-2xl font-bold mb-2">Residence Listing Not Found</h1>
          <p className="text-xs text-stone-500 max-w-sm mb-6">
            The property you are looking for may have been unlisted or removed.
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

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/"
            className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 flex items-center gap-1.5"
          >
            ← Back to Explore
          </a>
          <span className="text-xs font-bold text-gold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
            {property.neighborhood}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-2">{property.title}</h1>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mb-6">📍 {property.location}</p>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 rounded-2xl overflow-hidden shadow-md">
          <div className="md:col-span-2 h-72 sm:h-96">
            <img
              src={property.images[0] || "/images/maitama.png"}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4 h-96">
            {property.images.slice(1, 3).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className="w-full h-[calc(50%-8px)] object-cover rounded-xl"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
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
                    <span className="text-gold">✦</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="glass p-6 rounded-2xl border border-stone-200/50 dark:border-zinc-800/50 sticky top-24 space-y-4">
              {(() => {
                const totalFees =
                  (property.cautionFee || 0) +
                  (property.reservationFee || 0) +
                  (property.agencyFee || 0) +
                  (property.inspectionFee || 0) +
                  (property.legalFee || 0);
                const totalPkg = property.price + totalFees;

                return (
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-gold block mb-1">
                      Annual / Session Rent
                    </span>
                    <p className="text-3xl font-black text-stone-900 dark:text-zinc-50">
                      ₦{property.price.toLocaleString()} <span className="text-xs font-semibold text-stone-400">/ session</span>
                    </p>
                    <span className="text-xs text-amber-600 dark:text-amber-400 block font-extrabold mt-1">
                      Total Package with Fees: ₦{totalPkg.toLocaleString()}
                    </span>
                  </div>
                );
              })()}

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
                className="block text-center w-full py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold hover:text-white font-bold text-xs shadow-md transition-colors"
              >
                Make Inquiry
              </a>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {INITIAL_PROPERTIES.filter((p) => p.id !== property.id).length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200/50 dark:border-zinc-800/50">
            <h2 className="text-xl font-black mb-1">Similar Residences You Might Like</h2>
            <p className="text-xs text-stone-500 mb-6">Compare other managed listings in nearby locations</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {INITIAL_PROPERTIES.filter((p) => p.id !== property.id).slice(0, 3).map((simProp) => (
                <a
                  key={simProp.id}
                  href={`/properties/${simProp.id}`}
                  className="group glass rounded-2xl overflow-hidden border border-stone-200/50 dark:border-zinc-800/50 hover:border-gold/60 transition-all flex flex-col"
                >
                  <div className="h-40 w-full overflow-hidden relative">
                    <img
                      src={simProp.images[0] || "/images/ehis_hostel.png"}
                      alt={simProp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full">
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
                      <span className="text-xs font-bold text-gold group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
