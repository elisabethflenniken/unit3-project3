import { useCallback, useEffect, useState } from "react";

export const SEATTLE_DOWNTOWN: [number, number] = [47.6062, -122.3321];

export type GeoStatus = "prompt" | "granted" | "denied" | "unsupported";

interface GeolocationState {
  position: [number, number];
  status: GeoStatus;
  isUsingFallback: boolean;
  requestLocation: () => void;
}

export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<[number, number]>(SEATTLE_DOWNTOWN);
  const [status, setStatus] = useState<GeoStatus>("prompt");
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      setIsUsingFallback(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setStatus("granted");
        setIsUsingFallback(false);
      },
      () => {
        setStatus("denied");
        setPosition(SEATTLE_DOWNTOWN);
        setIsUsingFallback(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { position, status, isUsingFallback, requestLocation };
}
