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
      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          overflowX: "auto",
          pb: 0.5,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {FILTER_LABELS.map(({ key, label }) => {
          const selected = filters[key];
          // Only two visual states: default (white) and selected (blue) — hover/focus
          // must render identically to whichever of those states is already active,
          // so they're pinned to match MUI's own higher-specificity hover selector.
          const restingStyles = {
            bgcolor: selected ? "primary.main" : "background.paper",
            color: selected ? "common.white" : "text.primary",
            borderColor: selected ? "primary.main" : "divider",
          };
          return (
            <Chip
              key={key}
              label={label}
              size="small"
              clickable
              variant={selected ? "filled" : "outlined"}
              onClick={() => onToggleFilter(key)}
              sx={{
                ...restingStyles,
                flexShrink: 0,
                "&.MuiChip-clickable:hover, &.MuiChip-clickable:focus-visible": restingStyles,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
