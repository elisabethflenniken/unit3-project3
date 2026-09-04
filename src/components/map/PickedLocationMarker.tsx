import { useMemo } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

const svg = `
  <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 27 15 27s15-16 15-27C30 6.7 23.3 0 15 0z"
          fill="#1A73E8" stroke="#fff" stroke-width="3"/>
    <circle cx="15" cy="15" r="5" fill="#fff"/>
  </svg>
`;

const icon = L.divIcon({
  html: svg,
  className: "picked-location-pin",
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

export default function PickedLocationMarker({ position }: { position: [number, number] }) {
  const stableIcon = useMemo(() => icon, []);
  return <Marker position={position} icon={stableIcon} interactive={false} />;
}
