import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useUserData } from "../../context/UserDataContext";
import { useUserLocation } from "../../context/LocationContext";
import { haversineMeters, formatDistance, formatWalkTime } from "../../hooks/useDistance";
import { isOpenNow } from "../../utils/hours";

interface SavedListDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectRestroom: (id: string) => void;
}

export default function SavedListDrawer({ open, onClose, onSelectRestroom }: SavedListDrawerProps) {
  const { restrooms, savedIds } = useUserData();
  const { position: userPosition } = useUserLocation();

  const saved = restrooms.filter((r) => savedIds.includes(r.id));

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 320, maxWidth: "85vw", pt: "env(safe-area-inset-top)" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Saved restrooms
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Box>
        {saved.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Nothing saved yet. Tap a pin, then Save, to keep it here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {saved.map((restroom) => {
              const meters = haversineMeters(userPosition, [restroom.lat, restroom.lng]);
              const openNow = isOpenNow(restroom.hours);
              return (
                <ListItemButton
                  key={restroom.id}
                  onClick={() => {
                    onSelectRestroom(restroom.id);
                    onClose();
                  }}
                  sx={{ alignItems: "flex-start", py: 1.5 }}
                >
                  <ListItemText
                    primary={restroom.name}
                    secondary={`${restroom.neighborhood} · ${formatDistance(meters)} · ${formatWalkTime(meters)}`}
                  />
                  <Chip
                    label={openNow ? "Open" : "Closed"}
                    size="small"
                    color={openNow ? "success" : "default"}
                    sx={{ mt: 0.5, flexShrink: 0 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
