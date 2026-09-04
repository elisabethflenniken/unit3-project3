import { useMemo } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import type { Restroom } from "../../types/restroom";
import { useUserData } from "../../context/UserDataContext";

type PinState = "default" | "selected" | "visited";

// default = never opened; selected = the pin whose detail sheet is open right
// now; visited = opened at some point this session/device but not currently open.
const COLORS: Record<PinState, { fill: string; outline: string }> = {
  default: { fill: "#1A73E8", outline: "#0B57D0" },
  selected: { fill: "#0B3E91", outline: "#062A66" },
  visited: { fill: "#8AB4F8", outline: "#1A73E8" },
};

// Teardrop pin geometry. PAD keeps the stroke from being clipped by the SVG
// root's default overflow:hidden; SCALE shrinks the whole icon down from its
// original hand-drawn size without needing to touch the path's coordinates.
const PIN_PAD = 3;
const PIN_BASE_WIDTH = 34 + PIN_PAD * 2;
const PIN_BASE_HEIGHT = 46 + PIN_PAD * 2;
const PIN_SCALE = 0.72;
const PIN_WIDTH = PIN_BASE_WIDTH * PIN_SCALE;
const PIN_HEIGHT = PIN_BASE_HEIGHT * PIN_SCALE;

// A small white heart glyph (Material "Favorite" path) overlaid on saved
// pins, scaled and centered into the pin's rounded top (~17,17 in path space).
const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
const HEART_SCALE = 0.72;
const HEART_CENTER = { x: 12, y: 12.175 };
const HEART_TARGET = { x: 17, y: 15.5 };
const HEART_DX = HEART_TARGET.x - HEART_CENTER.x * HEART_SCALE;
const HEART_DY = HEART_TARGET.y - HEART_CENTER.y * HEART_SCALE;

function getPinState(isSelected: boolean, isVisited: boolean): PinState {
  if (isSelected) return "selected";
  if (isVisited) return "visited";
  return "default";
}

function buildPinIcon(state: PinState, isSaved: boolean): L.DivIcon {
  const { fill, outline } = COLORS[state];
  const heart = isSaved
    ? `<g transform="translate(${HEART_DX.toFixed(2)},${HEART_DY.toFixed(2)}) scale(${HEART_SCALE})">
         <path d="${HEART_PATH}" fill="#fff"/>
       </g>`
    : "";

  const svg = `
    <svg width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="-${PIN_PAD} -${PIN_PAD} ${PIN_BASE_WIDTH} ${PIN_BASE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 29 17 29s17-16.6 17-29C34 7.6 26.4 0 17 0z"
            fill="${fill}" stroke="${outline}" stroke-width="2.5"/>
      ${heart}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "restroom-pin",
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: [PIN_WIDTH / 2, PIN_HEIGHT - PIN_PAD * PIN_SCALE],
    popupAnchor: [0, -PIN_HEIGHT * 0.85],
  });
}

interface RestroomMarkerProps {
  restroom: Restroom;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function RestroomMarker({ restroom, isSelected, onSelect }: RestroomMarkerProps) {
  const { isSaved, isVisited } = useUserData();
  const saved = isSaved(restroom.id);
  const state = getPinState(isSelected, isVisited(restroom.id));

  const icon = useMemo(() => buildPinIcon(state, saved), [state, saved]);

  return (
    <Marker
      position={[restroom.lat, restroom.lng]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(restroom.id) }}
    />
  );
}
