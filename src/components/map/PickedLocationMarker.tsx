import { useMemo } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";

// Extra margin around the pin's true bounding box (0..30, 0..42) so the
// stroke doesn't get clipped by the SVG root's default overflow:hidden.
const PAD = 3;
const WIDTH = 30 + PAD * 2;
const HEIGHT = 42 + PAD * 2;

const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="-${PAD} -${PAD} ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 27 15 27s15-16 15-27C30 6.7 23.3 0 15 0z"
          fill="#1A73E8" stroke="#0B57D0" stroke-width="2.5"/>
  </svg>
`;

const icon = L.divIcon({
  html: svg,
  className: "picked-location-pin",
  iconSize: [WIDTH, HEIGHT],
  iconAnchor: [WIDTH / 2, HEIGHT - PAD],
});

export default function PickedLocationMarker({ position }: { position: [number, number] }) {
  const stableIcon = useMemo(() => icon, []);
  return <Marker position={position} icon={stableIcon} interactive={false} />;
}
