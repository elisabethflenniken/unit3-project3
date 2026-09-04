import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import AccessibleIcon from "@mui/icons-material/Accessible";
import WcIcon from "@mui/icons-material/Wc";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import PersonIcon from "@mui/icons-material/Person";
import type { Restroom } from "../../types/restroom";
import { toSentenceCase } from "../../utils/text";

const chipSx = { bgcolor: "background.paper", borderColor: "divider" };

export default function AmenityChips({ restroom }: { restroom: Restroom }) {
  const flagChips = [
    restroom.isAdaAccessible && (
      <Chip key="ada" icon={<AccessibleIcon />} label="ADA accessible" size="small" variant="outlined" sx={chipSx} />
    ),
    restroom.isGenderNeutral && (
      <Chip key="gender-neutral" icon={<WcIcon />} label="Gender-neutral" size="small" variant="outlined" sx={chipSx} />
    ),
    restroom.hasBabyChanging && (
      <Chip key="baby-changing" icon={<ChildFriendlyIcon />} label="Baby changing" size="small" variant="outlined" sx={chipSx} />
    ),
    restroom.isSingleOccupancy && (
      <Chip key="single-occupancy" icon={<PersonIcon />} label="Single-occupancy" size="small" variant="outlined" sx={chipSx} />
    ),
  ].filter(Boolean);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {flagChips}
      {restroom.amenities.map((amenity) => (
        <Chip key={amenity} label={toSentenceCase(amenity)} size="small" variant="outlined" sx={chipSx} />
      ))}
    </Box>
  );
}
