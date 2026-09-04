import { createTheme } from "@mui/material/styles";

// Single source of truth for the app's look. Components should reference
// theme tokens (theme.palette.success.main, etc.) rather than hardcoding hex values.
const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F8F9FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1D1F",
      secondary: "#5F6368",
    },
    primary: {
      main: "#1A73E8", // Google-Maps-blue accent for links/active states
    },
    success: {
      main: "#1E8E3E", // open now
    },
    warning: {
      main: "#B45309", // needs a code / access-restricted (darkened for outdoor contrast)
    },
    error: {
      main: "#D93025",
    },
    info: {
      main: "#8430CE", // unverified / not yet rated
    },
    grey: {
      500: "#9AA0A6", // closed
    },
    divider: "#E0E3E7",
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Manrope", -apple-system, "Segoe UI", sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 44,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        // Clickable chips (filter pills, amenity toggles) default to a washed-out
        // hover overlay that can look nearly invisible against a white chip.
        // MUI's own base styles set that overlay via the higher-specificity
        // selector "&.MuiChip-clickable:hover" (two classes, not one) — this has
        // to match that exact selector shape or it loses on backgroundColor.
        clickable: ({ theme }) => ({
          "&.MuiChip-clickable:hover, &.MuiChip-clickable:focus-visible": {
            backgroundColor: theme.palette.primary.dark,
            color: theme.palette.common.white,
            borderColor: theme.palette.primary.dark,
          },
          "&.MuiChip-clickable:hover .MuiChip-icon, &.MuiChip-clickable:focus-visible .MuiChip-icon": {
            color: theme.palette.common.white,
          },
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
