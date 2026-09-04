import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import SearchIcon from "@mui/icons-material/Search";
import BookmarksIcon from "@mui/icons-material/Bookmarks";

export interface FilterState {
  openNow: boolean;
  ada: boolean;
  genderNeutral: boolean;
  noCode: boolean;
}

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: FilterState;
  onToggleFilter: (key: keyof FilterState) => void;
  onOpenSaved: () => void;
}

const FILTER_LABELS: { key: keyof FilterState; label: string }[] = [
  { key: "openNow", label: "Open now" },
  { key: "ada", label: "ADA accessible" },
  { key: "genderNeutral", label: "Gender-neutral" },
  { key: "noCode", label: "No code needed" },
];

export default function TopBar({ searchQuery, onSearchChange, filters, onToggleFilter, onOpenSaved }: TopBarProps) {
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
          borderRadius: 999,
        }}
      >
        <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
        <InputBase
          placeholder="Search restrooms or neighborhoods"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flex: 1, fontSize: 15 }}
        />
        <IconButton onClick={onOpenSaved} aria-label="Saved restrooms" size="small">
          <BookmarksIcon />
        </IconButton>
      </Paper>
      <Box sx={{ display: "flex", gap: 0.75, overflowX: "auto", pb: 0.5 }}>
        {FILTER_LABELS.map(({ key, label }) => (
          <Chip
            key={key}
            label={label}
            size="small"
            clickable
            color={filters[key] ? "primary" : "default"}
            variant={filters[key] ? "filled" : "outlined"}
            onClick={() => onToggleFilter(key)}
            sx={{ bgcolor: filters[key] ? undefined : "background.paper", flexShrink: 0 }}
          />
        ))}
      </Box>
    </Box>
  );
}
