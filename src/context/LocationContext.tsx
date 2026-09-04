import { createContext, useContext, type ReactNode } from "react";
import { useGeolocation, type GeoStatus } from "../hooks/useGeolocation";

interface LocationContextValue {
  position: [number, number];
  status: GeoStatus;
  isUsingFallback: boolean;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const geo = useGeolocation();
  return <LocationContext.Provider value={geo}>{children}</LocationContext.Provider>;
}

export function useUserLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useUserLocation must be used within a LocationProvider");
  return ctx;
}
