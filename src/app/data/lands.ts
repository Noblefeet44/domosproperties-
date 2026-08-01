export interface LandProperty {
  id: string;
  title: string;
  description: string;
  price: number; // Total Price in ₦
  cautionFee?: number;
  reservationFee?: number;
  agencyFee?: number;
  inspectionFee?: number;
  legalFee?: number;
  size: string; // e.g. 1 Plot (600 sqm), 2 Acres, 100ft x 100ft
  titleDocument: string; // C of O, Deed of Assignment, Gazette, Survey Plan, Excision, Governor Consent
  zoning: 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
  status: 'dry_land' | 'fenced' | 'corner_piece' | 'under_development';
  location: string;
  neighborhood: string;
  images: string[];
  features: string[];
  googleMapsUrl?: string;
  agentPhone?: string;
  agentId?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
  featured?: boolean;
}

export const INITIAL_LANDS: LandProperty[] = [];
