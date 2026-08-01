export interface Car {
  id: string;
  title: string;
  description: string;
  listingType: 'rent' | 'sale';
  price: number; // Daily Rate if rent, Total Price if sale (in ₦)
  make: string; // e.g. Toyota, Lexus, Mercedes-Benz
  model: string; // e.g. Camry, RX 350, GLE 450
  year: number;
  transmission: 'automatic' | 'manual';
  fuelType: string; // Petrol, Diesel, Hybrid, Electric
  seats: number;
  mileage: string;
  condition: 'brand_new' | 'foreign_used' | 'local_used';
  location: string;
  images: string[];
  features: string[];
  agentPhone?: string;
  agentId?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
  featured?: boolean;
}

export const INITIAL_CARS: Car[] = [];
