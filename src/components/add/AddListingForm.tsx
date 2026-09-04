import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import MapView from "../map/MapView";
import type { AccessType, Hours } from "../../types/restroom";
import { useUserData } from "../../context/UserDataContext";
import { toSentenceCase } from "../../utils/text";
import { getToggleChipSx } from "../../utils/chipToggleStyle";

const ACCESS_TYPES: { value: AccessType; label: string }[] = [
  { value: "fully_public", label: "Fully public" },
  { value: "business", label: "Business (customers)" },
  { value: "park", label: "Park" },
  { value: "transit", label: "Transit station" },
  { value: "government", label: "Government building" },
];

const AMENITY_OPTIONS = [
  "toilet paper",
  "soap",
  "hand dryer",
  "running water",
  "baby changing station",
  "well-lit",
];

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

interface AddListingFormProps {
  open: boolean;
  onClose: () => void;
  initialPosition: [number, number];
  onCreated: (result: { id: string; name: string; lat: number; lng: number }) => void;
}

export default function AddListingForm({ open, onClose, initialPosition, onCreated }: AddListingFormProps) {
  const { addRestroom } = useUserData();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [pickedPosition, setPickedPosition] = useState<[number, number] | null>(null);
  const [accessType, setAccessType] = useState<AccessType>("fully_public");
  const [requiresPurchase, setRequiresPurchase] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isAdaAccessible, setIsAdaAccessible] = useState(false);
  const [isGenderNeutral, setIsGenderNeutral] = useState(false);
  const [isSingleOccupancy, setIsSingleOccupancy] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [alwaysOpen, setAlwaysOpen] = useState(true);
  const [openTime, setOpenTime] = useState("06:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setAddress("");
    setNeighborhood("");
    setPickedPosition(null);
    setAccessType("fully_public");
    setRequiresPurchase(false);
    setAccessCode("");
    setIsAdaAccessible(false);
    setIsGenderNeutral(false);
    setIsSingleOccupancy(false);
    setAmenities([]);
    setDescription("");
    setAlwaysOpen(true);
    setOpenTime("06:00");
    setCloseTime("22:00");
    setError(null);
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]));
  };

  // "Baby changing station" already lives in the amenities list, so it isn't
  // duplicated as its own accommodation flag — hasBabyChanging is derived
  // from that selection instead of tracked separately.
  const flagOptions: { label: string; checked: boolean; onToggle: () => void }[] = [
    { label: "ADA accessible", checked: isAdaAccessible, onToggle: () => setIsAdaAccessible((v) => !v) },
    { label: "Gender-neutral", checked: isGenderNeutral, onToggle: () => setIsGenderNeutral((v) => !v) },
    { label: "Single-occupancy", checked: isSingleOccupancy, onToggle: () => setIsSingleOccupancy((v) => !v) },
    { label: "Requires purchase", checked: requiresPurchase, onToggle: () => setRequiresPurchase((v) => !v) },
  ];

  const handleSubmit = () => {
    if (!name.trim() || !address.trim() || !neighborhood.trim()) {
      setError("Name, address, and neighborhood are required.");
      return;
    }
    if (!pickedPosition) {
      setError("Tap the map to drop a pin at the restroom's location.");
      return;
    }

    const hours: Hours = alwaysOpen
      ? { alwaysOpen: true }
      : {
          alwaysOpen: false,
          schedule: Object.fromEntries(DAY_KEYS.map((d) => [d, { open: openTime, close: closeTime }])),
        };

    const trimmedName = name.trim();
    const id = addRestroom({
      name: trimmedName,
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      lat: pickedPosition[0],
      lng: pickedPosition[1],
      accessType,
      requiresPurchase,
      accessCode: accessCode.trim() || null,
      isAdaAccessible,
      isGenderNeutral,
      hasBabyChanging: amenities.includes("baby changing station"),
      isSingleOccupancy,
      amenities,
      description: description.trim(),
      hours,
    });

    const [lat, lng] = pickedPosition;
    resetForm();
    onCreated({ id, name: trimmedName, lat, lng });
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: "background.paper" }}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, flex: 1, fontWeight: 700 }}>
            Add a restroom
          </Typography>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, pb: "env(safe-area-inset-bottom)" }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Tap the map to drop a pin at the location
          </Typography>
          <Box sx={{ height: 240, borderRadius: 2, overflow: "hidden" }}>
            <MapView
              restrooms={[]}
              userPosition={initialPosition}
              onSelectRestroom={() => {}}
              pickerMode
              pickedPosition={pickedPosition}
              onPick={(lat, lng) => setPickedPosition([lat, lng])}
            />
          </Box>
        </Box>

        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
        <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth required />
        <TextField
          label="Neighborhood"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Facility type"
          select
          value={accessType}
          onChange={(e) => setAccessType(e.target.value as AccessType)}
          fullWidth
        >
          {ACCESS_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />

        <TextField
          label="Access code (leave blank if none)"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          fullWidth
        />

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Hours
          </Typography>
          <FormControlLabel
            control={<Switch checked={alwaysOpen} onChange={(e) => setAlwaysOpen(e.target.checked)} />}
            label="Open 24/7"
          />
          {!alwaysOpen && (
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                label="Opens"
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
              />
              <TextField
                label="Closes"
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
              />
            </Box>
          )}
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Amenities
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {AMENITY_OPTIONS.map((amenity) => {
              const selected = amenities.includes(amenity);
              return (
                <Chip
                  key={amenity}
                  label={toSentenceCase(amenity)}
                  clickable
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => toggleAmenity(amenity)}
                  sx={getToggleChipSx(selected)}
                />
              );
            })}
            {flagOptions.map((flag) => (
              <Chip
                key={flag.label}
                label={flag.label}
                clickable
                variant={flag.checked ? "filled" : "outlined"}
                onClick={flag.onToggle}
                sx={getToggleChipSx(flag.checked)}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
