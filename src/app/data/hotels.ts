export interface HotelRoomType {
  name: string;
  price: number;
  image?: string;
  status: 'available' | 'booked';
}

export interface Hotel {
  id: string;
  title: string;
  description: string;
  pricePerNight: number; // Nightly rate in Naira (₦)
  location: string;
  neighborhood: string;
  starRating: number;
  reviewsCount: number;
  images: string[];
  amenities: string[];
  rooms?: HotelRoomType[];
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  agentPhone?: string;
  agentId?: string;
  googleMapsUrl?: string;
  featured?: boolean;
}

export const INITIAL_HOTELS: Hotel[] = [];
