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
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Ehis Hostel (Executive Student Lodge)",
    description: "Ultra-modern, highly secured student residence located right next to AAU Main Gate in Ekpoma. Features 24/7 security guard, uninterrupted borehole water supply, pre-paid individual meters, tiled floors, pop ceilings, and spacious balconies for academic comfort.",
    price: 350000,
    cautionFee: 30000,
    reservationFee: 20000,
    location: "AAU Main Gate, Ekpoma, Edo State",
    neighborhood: "AAU Main Gate",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.9,
    reviewsCount: 14,
    images: ["/images/ehis_hostel.png", "/images/treasure_hostel.png", "/images/elite_hostel.png", "/images/royal_villa.png"],
    amenities: ["24/7 Borehole Water", "Gated Security Guard", "Prepaid Electricity Meter", "Private Balcony", "Tiled Flooring", "Reading Study Desk", "Waste Management"],
    featured: true,
    agentPhone: "07073537007",
    googleMapsUrl: "https://maps.google.com/?q=Ambrose+Alli+University+Ekpoma",
    rooms: [
      { roomNumber: "Room 101 (Block A)", status: "occupied", type: "Self-Contained Single", price: 350000 },
      { roomNumber: "Room 102 (Block A)", status: "available", type: "Self-Contained Single", price: 350000 },
      { roomNumber: "Room 103 (Block A)", status: "available", type: "Self-Contained Double", price: 420000 },
      { roomNumber: "Room 104 (Block A)", status: "reserved", type: "Self-Contained Single", price: 350000 },
      { roomNumber: "Room 201 (Block B)", status: "available", type: "Executive Suite", price: 450000 },
      { roomNumber: "Room 202 (Block B)", status: "occupied", type: "Self-Contained Single", price: 350000 },
    ],
    reviews: [
      {
        id: "r1",
        guestName: "Emmanuel Osagie",
        avatar: "EO",
        rating: 5,
        date: "July 12, 2026",
        comment: "Best hostel near AAU main gate! The water supply is always constant and security is 100% reliable."
      },
      {
        id: "r2",
        guestName: "Blessing Ijewere",
        avatar: "BI",
        rating: 5,
        date: "June 28, 2026",
        comment: "DOMOS PROPERTY team made my rent payment seamless. Very honest hostel management in Ekpoma."
      }
    ]
  },
  {
    id: "2",
    title: "Treasure Hostel & Luxury Apartments",
    description: "Contemporary student apartments situated along the Benin-Auchi Expressway in Ekpoma. Designed for students seeking peaceful study conditions, ample parking space, fenced gate compound, and proximity to campus shuttle buses.",
    price: 320000,
    cautionFee: 25000,
    reservationFee: 20000,
    location: "Benin-Auchi Expressway, Ekpoma, Edo State",
    neighborhood: "Benin-Auchi Expressway",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.85,
    reviewsCount: 9,
    images: ["/images/treasure_hostel.png", "/images/ehis_hostel.png", "/images/royal_villa.png", "/images/elite_hostel.png"],
    amenities: ["Security Gate House", "Solar Street Lighting", "Constant Piped Water", "Spacious Kitchenette", "Ample Parking", "Clean Sanitation"],
    featured: true,
    agentPhone: "07073537007",
    googleMapsUrl: "https://maps.google.com/?q=Ekpoma+Benin+Auchi+Expressway",
    rooms: [
      { roomNumber: "Room 1 (Ground Floor)", status: "available", type: "Single Room Self-Contain", price: 320000 },
      { roomNumber: "Room 2 (Ground Floor)", status: "occupied", type: "Single Room Self-Contain", price: 320000 },
      { roomNumber: "Room 3 (First Floor)", status: "available", type: "Deluxe Self-Contain", price: 380000 },
      { roomNumber: "Room 4 (First Floor)", status: "available", type: "Single Room Self-Contain", price: 320000 },
    ],
    reviews: [
      {
        id: "r4",
        guestName: "Solomon Eghosa",
        avatar: "SE",
        rating: 5,
        date: "July 2, 2026",
        comment: "Fenced compound with steady light and water. Easy connection to campus everyday."
      }
    ]
  },
  {
    id: "3",
    title: "Elite Residence & Student Suites",
    description: "Premium self-contained student lodgings in Ihniduma, Ekpoma. Fitted with modern plumbing, wardrobes, fully tiled interiors, and dedicated solar street lighting for maximum safety.",
    price: 400000,
    cautionFee: 35000,
    reservationFee: 25000,
    location: "Ihniduma Quarters, Ekpoma, Edo State",
    neighborhood: "Ihniduma",
    bedrooms: 2,
    bathrooms: 1,
    guests: 3,
    rating: 4.95,
    reviewsCount: 11,
    images: ["/images/elite_hostel.png", "/images/royal_villa.png", "/images/ehis_hostel.png", "/images/treasure_hostel.png"],
    amenities: ["Private En-suite Bathroom", "Individual Prepaid Meter", "Dedicated Solar Inverter", "Fenced Security Guard", "Wardrobes Included"],
    featured: true,
    agentPhone: "07073537007",
    googleMapsUrl: "https://maps.google.com/?q=Ihniduma+Ekpoma",
    rooms: [
      { roomNumber: "Suite A1", status: "available", type: "2 Bedroom Student Flat", price: 400000 },
      { roomNumber: "Suite A2", status: "occupied", type: "2 Bedroom Student Flat", price: 400000 },
      { roomNumber: "Suite B1", status: "available", type: "Self-Contained Studio", price: 350000 },
    ],
    reviews: [
      {
        id: "r6",
        guestName: "Victoria Ose",
        avatar: "VO",
        rating: 5,
        date: "July 15, 2026",
        comment: "Very neat environment and the rooms are really spacious. DOMOS Property is 100% genuine."
      }
    ]
  },
  {
    id: "4",
    title: "Royal Villa Student Apartments",
    description: "High-demand residential accommodation on University Road, Ekpoma. Perfect for students and staff looking for serene ambiance, modern building architecture, and proximity to lecture halls.",
    price: 380000,
    cautionFee: 30000,
    reservationFee: 20000,
    location: "University Road, Ekpoma, Edo State",
    neighborhood: "University Road",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.88,
    reviewsCount: 8,
    images: ["/images/royal_villa.png", "/images/elite_hostel.png", "/images/treasure_hostel.png", "/images/ehis_hostel.png"],
    amenities: ["Paved Access Road", "High Pressure Water Pump", "Compound Security", "Fitted Kitchen Cabinets", "Cross Ventilation Balconies"],
    featured: false,
    agentPhone: "07073537007",
    googleMapsUrl: "https://maps.google.com/?q=University+Road+Ekpoma",
    rooms: [
      { roomNumber: "Villa 101", status: "occupied", type: "1 Bed Apartment", price: 380000 },
      { roomNumber: "Villa 102", status: "available", type: "1 Bed Apartment", price: 380000 },
      { roomNumber: "Villa 103", status: "available", type: "Self-Contain Standard", price: 350000 },
    ],
    reviews: []
  }
];

