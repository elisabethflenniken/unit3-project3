const EARTH_RADIUS_M = 6371000;
const AVERAGE_WALK_SPEED_M_PER_MIN = 84; // ~3.1 mph

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineMeters(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatWalkTime(meters: number): string {
  const minutes = Math.max(1, Math.round(meters / AVERAGE_WALK_SPEED_M_PER_MIN));
  return minutes === 1 ? "1 min walk" : `${minutes} min walk`;
}

export function useDistance(
  from: [number, number],
  to: [number, number]
): { meters: number; distanceLabel: string; walkTimeLabel: string } {
  const meters = haversineMeters(from, to);
  return {
    meters,
    distanceLabel: formatDistance(meters),
    walkTimeLabel: formatWalkTime(meters),
  };
}
