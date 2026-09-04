import { useMemo } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

const icon = L.divIcon({
  html: `
    <div class="user-location-blip">
      <div class="user-location-blip__pulse"></div>
      <div class="user-location-blip__dot"></div>
    </div>
  `,
  className: "user-location-icon",
  iconSize: [46, 46],
  iconAnchor: [23, 23],
});

interface UserLocationMarkerProps {
  position: [number, number];
}

export default function UserLocationMarker({ position }: UserLocationMarkerProps) {
  const stableIcon = useMemo(() => icon, []);
  return <Marker position={position} icon={stableIcon} interactive={false} />;
}
