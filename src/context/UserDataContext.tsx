import { createContext, useContext, useMemo, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import seedRestrooms from "../data/restrooms.json";
import type { Restroom, RatingKey } from "../types/restroom";
import { useLocalStorage } from "../hooks/useLocalStorage";

type RatingOverrides = Record<string, Partial<Record<RatingKey, number>>>;

type NewRestroomInput = Omit<Restroom, "id" | "ratings" | "lastVerified" | "source">;

interface UserDataContextValue {
  restrooms: Restroom[];
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  submitRating: (id: string, dimension: RatingKey, value: number) => void;
  myRatingFor: (id: string) => Partial<Record<RatingKey, number>>;
  addRestroom: (input: NewRestroomInput) => string;
  reportIssue: (id: string, reason: string) => void;
  reportsFor: (id: string) => string[];
  resetAllData: () => void;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

function applyOverride(restroom: Restroom, overrides: RatingOverrides): Restroom {
  const override = overrides[restroom.id];
  if (!override) return restroom;

  const ratings = { ...restroom.ratings };
  (Object.keys(override) as RatingKey[]).forEach((dimension) => {
    const value = override[dimension];
    if (value === undefined) return;
    const base = restroom.ratings[dimension];
    const newCount = base.count + 1;
    const newAverage = (base.average * base.count + value) / newCount;
    ratings[dimension] = { average: Math.round(newAverage * 10) / 10, count: newCount };
  });

  return { ...restroom, ratings };
}

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useLocalStorage<string[]>("pitstop.savedIds", []);
  const [ratingOverrides, setRatingOverrides] = useLocalStorage<RatingOverrides>(
    "pitstop.ratingOverrides",
    {}
  );
  const [userRestrooms, setUserRestrooms] = useLocalStorage<Restroom[]>(
    "pitstop.userRestrooms",
    []
  );
  const [reports, setReports] = useLocalStorage<Record<string, string[]>>(
    "pitstop.reports",
    {}
  );

  const restrooms = useMemo(() => {
    const all = [...(seedRestrooms as Restroom[]), ...userRestrooms];
    return all.map((r) => applyOverride(r, ratingOverrides));
  }, [userRestrooms, ratingOverrides]);

  const isSaved = (id: string) => savedIds.includes(id);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submitRating = (id: string, dimension: RatingKey, value: number) => {
    setRatingOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], [dimension]: value },
    }));
  };

  const myRatingFor = (id: string) => ratingOverrides[id] ?? {};

  const addRestroom = (input: NewRestroomInput): string => {
    const id = uuidv4();
    const newRestroom: Restroom = {
      ...input,
      id,
      ratings: {
        cleanliness: { average: 0, count: 0 },
        safety: { average: 0, count: 0 },
        privacy: { average: 0, count: 0 },
      },
      lastVerified: new Date().toISOString().slice(0, 10),
      source: "user",
    };
    setUserRestrooms((prev) => [...prev, newRestroom]);
    return id;
  };

  const reportIssue = (id: string, reason: string) => {
    setReports((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), reason] }));
  };

  const reportsFor = (id: string) => reports[id] ?? [];

  const resetAllData = () => {
    setSavedIds([]);
    setRatingOverrides({});
    setUserRestrooms([]);
    setReports({});
  };

  const value: UserDataContextValue = {
    restrooms,
    savedIds,
    isSaved,
    toggleSaved,
    submitRating,
    myRatingFor,
    addRestroom,
    reportIssue,
    reportsFor,
    resetAllData,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataContextValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within a UserDataProvider");
  return ctx;
}
