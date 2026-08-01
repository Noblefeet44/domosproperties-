export interface Review {
  id: string;
  guestName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface HostelRoom {
  roomNumber: string;
  status: 'available' | 'occupied' | 'reserved';
  type: string;
  price: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in Naira (₦) per academic session / year
  cautionFee?: number; // Refundable caution fee
  reservationFee?: number; // Deposit fee to hold room
  agencyFee?: number; // Agency fee
  inspectionFee?: number; // Inspection fee
  legalFee?: number; // Legal fee
  location: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  amenities: string[];
  featured: boolean;
  reviews: Review[];
  rooms?: HostelRoom[];
  googleMapsUrl?: string;
  agentPhone?: string;
  agentId?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
  createdAt?: string;
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "Ehis Executive Lodge & Student Hostel",
    description: "Premium self-contained student lodge located right near Ambrose Alli University (AAU) Main Gate. Equipped with 24/7 security, continuous borehole water supply, pre-paid electricity meter, and modern tiled interiors.",
    price: 350000,
    cautionFee: 30000,
    reservationFee: 20000,
    agencyFee: 35000,
    inspectionFee: 5000,
    legalFee: 15000,
    location: "Ekpoma, Edo State",
    neighborhood: "AAU Main Gate",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.9,
    reviewsCount: 18,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"
    ],
    amenities: ["24/7 Security", "Borehole Water", "Prepaid Meter", "Paved Compound", "Fenced & Gated"],
    featured: true,
    agentPhone: "07073537007",
    agentId: "agent-main",
    reviews: [
      {
        id: "rev-1",
        guestName: "Emmanuel O.",
        avatar: "",
        rating: 5,
        date: "2024-02-10",
        comment: "Very clean environment and secure for AAU students. Water runs 24/7!"
      }
    ]
  },
  {
    id: "prop-2",
    title: "Royal Palms Student Villa & Studio Flats",
    description: "Newly built modern studio apartments in Ujoelen, Ekpoma. Offers spacious ensuite rooms, full kitchen cabinet, balcony, and serene study atmosphere suitable for serious students.",
    price: 280000,
    cautionFee: 25000,
    reservationFee: 15000,
    agencyFee: 28000,
    inspectionFee: 5000,
    legalFee: 10000,
    location: "Ekpoma, Edo State",
    neighborhood: "Ujoelen / Ihumudumu",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.8,
    reviewsCount: 12,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200"
    ],
    amenities: ["Ensuite Bathroom", "PVC Ceiling", "Kitchen Cabinet", "Solar Lighting", "Intercom System", "Water Supply"],
    featured: true,
    agentPhone: "07073537007",
    agentId: "agent-main",
    reviews: []
  },
  {
    id: "prop-3",
    title: "DOMOS Premier 2-Bedroom Executive Apartment",
    description: "Luxury 2-bedroom serviced apartment along University Road, Ekpoma. Features POP ceilings, water heater, ample parking space, dedicated security guard, and proximity to commercial banks and shopping centers.",
    price: 550000,
    cautionFee: 50000,
    reservationFee: 30000,
    agencyFee: 55000,
    inspectionFee: 5000,
    legalFee: 25000,
    location: "Ekpoma, Edo State",
    neighborhood: "University Road",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    rating: 5.0,
    reviewsCount: 25,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"
    ],
    amenities: ["POP Ceiling", "Water Heater", "Car Park", "24/7 Security", "Private Balcony"],
    featured: true,
    agentPhone: "07073537007",
    agentId: "agent-main",
    reviews: []
  }
];
