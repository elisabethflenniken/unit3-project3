import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useUserData } from "../context/UserDataContext";
import { useUserLocation } from "../context/LocationContext";
import { haversineMeters, formatDistance, formatWalkTime } from "../hooks/useDistance";

const DIVIDER_COLOR = "#F0F1F3";

export default function SavedPage() {
  const { restrooms, savedIds, toggleSaved } = useUserData();
  const { position: userPosition } = useUserLocation();
  const navigate = useNavigate();

  const saved = restrooms.filter((r) => savedIds.includes(r.id));

  return (
    <Box sx={{ height: "100%", overflowY: "auto", bgcolor: "background.default" }}>
      <Box sx={{ px: 2.5, pt: "calc(env(safe-area-inset-top) + 20px)", pb: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Saved restrooms
        </Typography>
      </Box>
      {saved.length === 0 ? (
        <Box sx={{ px: 2.5, py: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Nothing saved yet. Tap a pin on the map, then Save, to keep it here.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {saved.map((restroom, index) => {
            const meters = haversineMeters(userPosition, [restroom.lat, restroom.lng]);
            return (
              <Fragment key={restroom.id}>
                {index > 0 && <Divider sx={{ borderColor: DIVIDER_COLOR }} />}
                <ListItemButton
                  onClick={() => navigate(`/?restroom=${restroom.id}`)}
                  sx={{ alignItems: "center", py: 1.5, px: 2.5 }}
                >
                  <ListItemText
                    primary={restroom.name}
                    secondary={`${restroom.neighborhood} · ${formatDistance(meters)} · ${formatWalkTime(meters)}`}
                  />
                  <IconButton
                    aria-label={`Remove ${restroom.name} from saved`}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaved(restroom.id);
                    }}
                    sx={{ color: "primary.main", flexShrink: 0 }}
                  >
                    <FavoriteIcon fontSize="small" />
                  </IconButton>
                  <ChevronRightIcon sx={{ color: "text.secondary", flexShrink: 0, ml: 0.5 }} />
                </ListItemButton>
              </Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
}
