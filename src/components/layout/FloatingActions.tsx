import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";

interface FloatingActionsProps {
  onLocateMe: () => void;
  onAddListing: () => void;
}

export default function FloatingActions({ onLocateMe, onAddListing }: FloatingActionsProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        right: 16,
        // The bottom nav bar (not this container) now owns the physical
        // screen edge and its own safe-area padding, so this just needs
        // clearance from the map's own bottom edge.
        bottom: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Fab color="default" onClick={onLocateMe} aria-label="Locate me" size="medium">
        <MyLocationIcon />
      </Fab>
      <Fab color="primary" onClick={onAddListing} aria-label="Add a restroom" size="medium">
        <AddLocationAltIcon />
      </Fab>
    </Box>
  );
}
