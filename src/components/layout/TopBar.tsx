import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import type { Restroom } from "../../types/restroom";
import { useUserLocation } from "../../context/LocationContext";
import { haversineMeters, formatDistance, formatWalkTime } from "../../hooks/useDistance";
import { getToggleChipSx } from "../../utils/chipToggleStyle";

export interface FilterState {
  saved: boolean;
  openNow: boolean;
  ada: boolean;
  genderNeutral: boolean;
  noCode: boolean;
}

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchResults: Restroom[];
  onSelectResult: (id: string) => void;
  filters: FilterState;
  onToggleFilter: (key: keyof FilterState) => void;
}

const FILTER_LABELS: { key: keyof FilterState; label: string }[] = [
  { key: "saved", label: "Saved" },
  { key: "openNow", label: "Open now" },
  { key: "ada", label: "ADA accessible" },
  { key: "genderNeutral", label: "Gender-neutral" },
  { key: "noCode", label: "No code needed" },
];

export default function TopBar({
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectResult,
  filters,
  onToggleFilter,
}: TopBarProps) {
  const { position: userPosition } = useUserLocation();
  const showResults = searchQuery.trim().length > 0;

  return (
    <Box
      sx={{
        position: "absolute",
        top: "calc(env(safe-area-inset-top) + 12px)",
        left: 12,
        right: 12,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 0.5,
          borderRadius: showResults ? "20px 20px 0 0" : 999,
        }}
      >
        <SearchIcon sx={{ color: "#B0B4B9", mr: 1 }} />
        <InputBase
          placeholder="Search bathrooms"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flex: 1,
            fontSize: 15,
            "& input::placeholder": {
              color: "text.secondary",
              fontWeight: 500,
              opacity: 1,
            },
          }}
        />
        {searchQuery.length > 0 && (
          <IconButton onClick={() => onSearchChange("")} aria-label="Clear search" size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>

      {showResults && (
        <Paper elevation={3} sx={{ borderRadius: "0 0 16px 16px", overflow: "hidden", mt: "-8px" }}>
          {searchResults.length === 0 ? (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No restrooms match "{searchQuery}"
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {searchResults.map((restroom) => {
                const meters = haversineMeters(userPosition, [restroom.lat, restroom.lng]);
                return (
                  <ListItemButton key={restroom.id} onClick={() => onSelectResult(restroom.id)} sx={{ py: 1 }}>
                    <ListItemText
                      primary={restroom.name}
                      secondary={`${restroom.neighborhood} · ${formatDistance(meters)} · ${formatWalkTime(meters)}`}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Paper>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          overflowX: "auto",
          pb: 0.5,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
          // Break out of this header's 12px side inset so the row can scroll
          // all the way to the true screen edges instead of stopping short.
          mx: "-12px",
          px: "12px",
        }}
      >
        {FILTER_LABELS.map(({ key, label }) => {
          const selected = filters[key];
          return (
            <Chip
              key={key}
              label={label}
              size="small"
              clickable
              variant={selected ? "filled" : "outlined"}
              onClick={() => onToggleFilter(key)}
              sx={{ ...getToggleChipSx(selected), boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
