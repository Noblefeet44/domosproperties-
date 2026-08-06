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

export const INITIAL_PROPERTIES: Property[] = [];
