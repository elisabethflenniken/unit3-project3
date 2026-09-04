export type AccessType = "fully_public" | "business" | "park" | "transit" | "government";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Hours {
  // true if open 24/7 (schedule is ignored)
  alwaysOpen: boolean;
  // 24hr "HH:mm" open/close per day, or null for closed that day
  schedule?: Partial<Record<DayKey, { open: string; close: string } | null>>;
}

export interface RatingDimension {
  average: number;
  count: number;
}

export interface RatingSummary {
  cleanliness: RatingDimension;
  safety: RatingDimension; // well-lit / felt-safe
  privacy: RatingDimension; // functioning lock / private
}

export type RatingKey = keyof RatingSummary;

export interface Restroom {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  accessType: AccessType;
  requiresPurchase: boolean;
  accessCode: string | null;
  isAdaAccessible: boolean;
  isGenderNeutral: boolean;
  hasBabyChanging: boolean;
  isSingleOccupancy: boolean;
  amenities: string[];
  description: string;
  hours: Hours;
  ratings: RatingSummary;
  lastVerified: string; // ISO date string
  source: "seed" | "user";
  photoUrl?: string;
}
