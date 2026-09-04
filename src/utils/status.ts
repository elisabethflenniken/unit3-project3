import type { Restroom } from "../types/restroom";

export function isUnverified(restroom: Restroom): boolean {
  return (
    restroom.ratings.cleanliness.count === 0 &&
    restroom.ratings.safety.count === 0 &&
    restroom.ratings.privacy.count === 0
  );
}
