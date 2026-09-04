import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MapView from "../components/map/MapView";
import TopBar, { type FilterState } from "../components/layout/TopBar";
import FloatingActions from "../components/layout/FloatingActions";
import RestroomDetailSheet from "../components/detail/RestroomDetailSheet";
import AddListingForm from "../components/add/AddListingForm";
import { useUserData } from "../context/UserDataContext";
import { useUserLocation } from "../context/LocationContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { isOpenNow } from "../utils/hours";

const DEFAULT_FILTERS: FilterState = {
  saved: false,
  openNow: false,
  ada: false,
  genderNeutral: false,
  noCode: false,
};

const MAX_SEARCH_RESULTS = 6;

export default function MapPage() {
  const { restrooms, markVisited, isSaved } = useUserData();
  const { position: userPosition, requestLocation, status } = useUserLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [flyToTarget, setFlyToTarget] = useState<[number, number] | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [justAddedName, setJustAddedName] = useState<string | null>(null);
  // localStorage-backed (not useState) so switching tabs — which remounts this
  // page — doesn't re-show a toast the user already dismissed.
  const [locationToastDismissed, setLocationToastDismissed] = useLocalStorage(
    "pitstop.locationDeniedToastDismissed",
    false
  );

  const selectedId = searchParams.get("restroom");

  useEffect(() => {
    if (selectedId) markVisited(selectedId);
  }, [selectedId, markVisited]);

  // Deep-linking into the map (e.g. tapping a saved restroom from the Saved
  // tab) lands here with ?restroom already set — fly to it once on mount so
  // it's actually visible, not just open in a sheet over an unrelated view.
  useEffect(() => {
    if (selectedId) {
      const restroom = restrooms.find((r) => r.id === selectedId);
      if (restroom) setFlyToTarget([restroom.lat, restroom.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSelectedId = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("restroom", id);
    else next.delete("restroom");
    setSearchParams(next, { replace: false });
  };

  const matchesQuery = (query: string) => (r: (typeof restrooms)[number]) =>
    r.name.toLowerCase().includes(query) ||
    r.neighborhood.toLowerCase().includes(query) ||
    r.address.toLowerCase().includes(query);

  const filteredRestrooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const isMatch = matchesQuery(query);
    return restrooms.filter((r) => {
      if (query && !isMatch(r)) return false;
      if (filters.saved && !isSaved(r.id)) return false;
      if (filters.openNow && !isOpenNow(r.hours)) return false;
      if (filters.ada && !r.isAdaAccessible) return false;
      if (filters.genderNeutral && !r.isGenderNeutral) return false;
      if (filters.noCode && r.accessCode) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restrooms, searchQuery, filters, isSaved]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return restrooms.filter(matchesQuery(query)).slice(0, MAX_SEARCH_RESULTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restrooms, searchQuery]);

  const handleToggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectSearchResult = (id: string) => {
    const restroom = restrooms.find((r) => r.id === id);
    if (restroom) setFlyToTarget([restroom.lat, restroom.lng]);
    setSearchQuery("");
    setSelectedId(id);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <MapView
        restrooms={filteredRestrooms}
        userPosition={userPosition}
        selectedId={selectedId}
        onSelectRestroom={setSelectedId}
        flyToTarget={flyToTarget}
      />

      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectResult={handleSelectSearchResult}
        filters={filters}
        onToggleFilter={handleToggleFilter}
      />

      <FloatingActions
        onLocateMe={() => {
          setLocationToastDismissed(false);
          requestLocation();
        }}
        onAddListing={() => setAddFormOpen(true)}
      />

      <RestroomDetailSheet restroomId={selectedId} onClose={() => setSelectedId(null)} />

      <AddListingForm
        open={addFormOpen}
        onClose={() => setAddFormOpen(false)}
        initialPosition={userPosition}
        onCreated={({ id, name, lat, lng }) => {
          setAddFormOpen(false);
          setJustAddedName(name);
          setFlyToTarget([lat, lng]);
          setSelectedId(id);
        }}
      />

      <Snackbar
        open={status === "denied" && !locationToastDismissed}
        autoHideDuration={6000}
        onClose={() => setLocationToastDismissed(true)}
      >
        <Alert severity="warning" onClose={() => setLocationToastDismissed(true)}>
          Location access denied — showing downtown Seattle instead. Tap the locate button to try again.
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(justAddedName)} autoHideDuration={4000} onClose={() => setJustAddedName(null)}>
        <Alert severity="success" onClose={() => setJustAddedName(null)}>
          Added "{justAddedName}" — thanks for contributing!
        </Alert>
      </Snackbar>
    </Box>
  );
}
