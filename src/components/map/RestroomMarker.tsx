import { useMemo } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import type { Restroom } from "../../types/restroom";
import { getPinStatus, needsCode } from "../../utils/status";

const OPEN_COLOR = "#1E8E3E";
const CLOSED_COLOR = "#9AA0A6";
const CODE_RING_COLOR = "#B45309";
const NEW_BADGE_COLOR = "#8430CE";

function buildPinIcon(restroom: Restroom): L.DivIcon {
  const status = getPinStatus(restroom);
  const fill = status === "open" ? OPEN_COLOR : CLOSED_COLOR;
  const ring = needsCode(restroom) ? CODE_RING_COLOR : "#FFFFFF";
  const badge =
    restroom.source === "user"
      ? `<circle cx="27" cy="9" r="7" fill="${NEW_BADGE_COLOR}" stroke="#fff" stroke-width="2"/>
         <text x="27" y="12.5" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">N</text>`
      : "";

  const svg = `
    <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 29 17 29s17-16.6 17-29C34 7.6 26.4 0 17 0z"
            fill="${fill}" stroke="${ring}" stroke-width="3"/>
      <circle cx="17" cy="17" r="7" fill="#fff"/>
      ${badge}
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: "restroom-pin",
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -40],
  });
}

interface RestroomMarkerProps {
  restroom: Restroom;
  onSelect: (id: string) => void;
}

export default function RestroomMarker({ restroom, onSelect }: RestroomMarkerProps) {
  const icon = useMemo(() => buildPinIcon(restroom), [restroom]);

  return (
    <Marker
      position={[restroom.lat, restroom.lng]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(restroom.id) }}
    />
  );
}
