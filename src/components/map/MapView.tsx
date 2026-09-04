import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Restroom } from "../../types/restroom";
import RestroomMarker from "./RestroomMarker";
import UserLocationMarker from "./UserLocationMarker";
import PickedLocationMarker from "./PickedLocationMarker";

// Plain OpenStreetMap tiles: free, no API key or account required.
// (CARTO's free Positron tiles now watermark anonymous requests with "API key required".)
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function FlyToController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.8 });
    }
  }, [target, map]);
  return null;
}

function PickerClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapViewProps {
  restrooms: Restroom[];
  userPosition: [number, number];
  onSelectRestroom: (id: string) => void;
  flyToTarget?: [number, number] | null;
  pickerMode?: boolean;
  pickedPosition?: [number, number] | null;
  onPick?: (lat: number, lng: number) => void;
}

export default function MapView({
  restrooms,
  userPosition,
  onSelectRestroom,
  flyToTarget = null,
  pickerMode = false,
  pickedPosition = null,
  onPick,
}: MapViewProps) {
  return (
    <MapContainer
      center={userPosition}
      zoom={14}
      zoomControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <UserLocationMarker position={userPosition} />
      {restrooms.map((restroom) => (
        <RestroomMarker key={restroom.id} restroom={restroom} onSelect={onSelectRestroom} />
      ))}
      <FlyToController target={flyToTarget} />
      {pickerMode && onPick && <PickerClickHandler onPick={onPick} />}
      {pickerMode && pickedPosition && <PickedLocationMarker position={pickedPosition} />}
    </MapContainer>
  );
}
