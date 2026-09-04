import type { Restroom } from "../types/restroom";
import { isOpenNow } from "./hours";

export type PinStatus = "open" | "closed";

export function getPinStatus(restroom: Restroom, now: Date = new Date()): PinStatus {
  return isOpenNow(restroom.hours, now) ? "open" : "closed";
}

export function needsCode(restroom: Restroom): boolean {
  return Boolean(restroom.accessCode);
}

export function isUnverified(restroom: Restroom): boolean {
  return (
    restroom.ratings.cleanliness.count === 0 &&
    restroom.ratings.safety.count === 0 &&
    restroom.ratings.privacy.count === 0
  );
}
