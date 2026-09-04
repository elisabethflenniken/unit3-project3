import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MapView from "../components/map/MapView";
import TopBar, { type FilterState } from "../components/layout/TopBar";
import FloatingActions from "../components/layout/FloatingActions";
import RestroomDetailSheet from "../components/detail/RestroomDetailSheet";
import SavedListDrawer from "../components/saved/SavedListDrawer";
import AddListingForm from "../components/add/AddListingForm";
import { useUserData } from "../context/UserDataContext";
import { useUserLocation } from "../context/LocationContext";
import { isOpenNow } from "../utils/hours";

const DEFAULT_FILTERS: FilterState = {
  openNow: false,
  ada: false,
  genderNeutral: false,
  noCode: false,
};

export default function MapPage() {
  const { restrooms, markVisited } = useUserData();
  const { position: userPosition, requestLocation, status } = useUserLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [flyToTarget, setFlyToTarget] = useState<[number, number] | null>(null);
  const [savedListOpen, setSavedListOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [justAddedName, setJustAddedName] = useState<string | null>(null);
  const [locationToastDismissed, setLocationToastDismissed] = useState(false);

  const selectedId = searchParams.get("restroom");

  useEffect(() => {
    if (selectedId) markVisited(selectedId);
  }, [selectedId, markVisited]);

  const setSelectedId = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("restroom", id);
    else next.delete("restroom");
    setSearchParams(next, { replace: false });
  };

  const filteredRestrooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return restrooms.filter((r) => {
      if (query && !r.name.toLowerCase().includes(query) && !r.neighborhood.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.openNow && !isOpenNow(r.hours)) return false;
      if (filters.ada && !r.isAdaAccessible) return false;
      if (filters.genderNeutral && !r.isGenderNeutral) return false;
      if (filters.noCode && r.accessCode) return false;
      return true;
    });
  }, [restrooms, searchQuery, filters]);

  const handleToggleFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectFromSavedList = (id: string) => {
    const restroom = restrooms.find((r) => r.id === id);
    if (restroom) setFlyToTarget([restroom.lat, restroom.lng]);
    setSelectedId(id);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>
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
        filters={filters}
        onToggleFilter={handleToggleFilter}
        onOpenSaved={() => setSavedListOpen(true)}
      />

      <FloatingActions
        onLocateMe={() => {
          setLocationToastDismissed(false);
          requestLocation();
        }}
        onAddListing={() => setAddFormOpen(true)}
      />

      <RestroomDetailSheet restroomId={selectedId} onClose={() => setSelectedId(null)} />

      <SavedListDrawer
        open={savedListOpen}
        onClose={() => setSavedListOpen(false)}
        onSelectRestroom={handleSelectFromSavedList}
      />

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
