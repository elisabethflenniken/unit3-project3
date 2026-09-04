import { useState } from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DirectionsIcon from "@mui/icons-material/Directions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import FlagIcon from "@mui/icons-material/Flag";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import CloseIcon from "@mui/icons-material/Close";
import { useUserData } from "../../context/UserDataContext";
import { useUserLocation } from "../../context/LocationContext";
import { useDistance } from "../../hooks/useDistance";
import { isOpenNow, formatFullSchedule, formatHoursToday } from "../../utils/hours";
import { buildDirectionsUrl } from "../../utils/mapsLink";
import RateRestroomForm from "./RateRestroomForm";
import AmenityChips from "./AmenityChips";

const REPORT_REASONS = ["Code doesn't work", "Permanently closed", "Inaccurate info", "Unsafe / unclean"];

// Standard US address formatting: street on its own line, "City, State ZIP" on the next.
function splitAddress(address: string): [string, string] {
  const [street, ...rest] = address.split(",");
  return [street.trim(), rest.join(",").trim()];
}

interface RestroomDetailSheetProps {
  restroomId: string | null;
  onClose: () => void;
}

export default function RestroomDetailSheet({ restroomId, onClose }: RestroomDetailSheetProps) {
  const { restrooms, isSaved, toggleSaved, reportIssue } = useUserData();
  const { position: userPosition } = useUserLocation();
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [reportAnchor, setReportAnchor] = useState<HTMLElement | null>(null);

  const restroom = restrooms.find((r) => r.id === restroomId) ?? null;
  const open = Boolean(restroom);

  const distance = useDistance(userPosition, restroom ? [restroom.lat, restroom.lng] : userPosition);
  const openNow = restroom ? isOpenNow(restroom.hours) : false;

  const handleShare = async () => {
    if (!restroom) return;
    const url = `${window.location.origin}${window.location.pathname}?restroom=${restroom.id}`;
    const shareData = { title: restroom.name, text: `Restroom near you: ${restroom.name}`, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled share sheet — no action needed
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      transitionDuration={{ enter: 500, exit: 400 }}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "85vh",
            pb: "env(safe-area-inset-bottom)",
          },
        },
      }}
    >
      {restroom && (
        <Box sx={{ px: 2.5, pt: 1.5, pb: 3, overflowY: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: "divider" }} />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {restroom.name}
              </Typography>
              {restroom.source === "user" && (
                <Typography variant="caption" sx={{ color: "info.main", fontWeight: 600 }}>
                  Community contributed
                </Typography>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                <Chip
                  label={openNow ? "Open now" : "Closed"}
                  size="small"
                  color={openNow ? "success" : "default"}
                  sx={{ fontWeight: 700 }}
                />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {distance.distanceLabel} · {distance.walkTimeLabel}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Box>
              {splitAddress(restroom.address).map((line) => (
                <Typography key={line} variant="body2" sx={{ color: "text.secondary" }}>
                  {line}
                </Typography>
              ))}
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<DirectionsIcon />}
              href={buildDirectionsUrl(restroom.lat, restroom.lng)}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ flexShrink: 0 }}
            >
              Directions
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <RateRestroomForm restroom={restroom} />

          {restroom.accessCode && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VpnKeyIcon fontSize="small" sx={{ color: "warning.main" }} />
                <Typography variant="body2">
                  Access code: <strong>{restroom.accessCode}</strong>
                </Typography>
              </Box>
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <AmenityChips restroom={restroom} />

          <Divider sx={{ my: 2 }} />
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
            onClick={() => setHoursExpanded((v) => !v)}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Hours
              </Typography>
              {!hoursExpanded && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Today: {formatHoursToday(restroom.hours)}
                </Typography>
              )}
            </Box>
            <IconButton size="small" sx={{ transform: hoursExpanded ? "rotate(180deg)" : "none" }}>
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Box>
          <Collapse in={hoursExpanded}>
            <Box sx={{ mt: 1 }}>
              {formatFullSchedule(restroom.hours).map(({ day, text }) => (
                <Box key={day} sx={{ display: "flex", justifyContent: "space-between", py: 0.25 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {day}
                  </Typography>
                  <Typography variant="caption">{text}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>

          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {restroom.description}
          </Typography>

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              variant={isSaved(restroom.id) ? "contained" : "outlined"}
              startIcon={isSaved(restroom.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={() => toggleSaved(restroom.id)}
            >
              {isSaved(restroom.id) ? "Saved" : "Save"}
            </Button>
            <Button size="small" variant="outlined" startIcon={<ShareIcon />} onClick={handleShare}>
              Share
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<FlagIcon />}
              onClick={(e) => setReportAnchor(e.currentTarget)}
            >
              Report
            </Button>
            <Menu anchorEl={reportAnchor} open={Boolean(reportAnchor)} onClose={() => setReportAnchor(null)}>
              {REPORT_REASONS.map((reason) => (
                <MenuItem
                  key={reason}
                  onClick={() => {
                    reportIssue(restroom.id, reason);
                    setReportAnchor(null);
                  }}
                >
                  {reason}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.disabled" }}>
            Last verified {restroom.lastVerified}
          </Typography>
        </Box>
      )}
    </SwipeableDrawer>
  );
}
