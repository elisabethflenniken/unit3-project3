// Shared two-state toggle chip styling: default (white, gray outline) vs
// selected (filled primary blue). Hover/focus are pinned to match whichever
// state is already active — matching MUI's own higher-specificity hover
// selector ("&.MuiChip-clickable:hover", two classes) so the resting style
// actually wins instead of MUI's washed-out default hover overlay.
export function getToggleChipSx(selected: boolean) {
  const restingStyles = {
    bgcolor: selected ? "primary.main" : "background.paper",
    color: selected ? "common.white" : "text.primary",
    borderColor: selected ? "primary.main" : "divider",
  };
  return {
    ...restingStyles,
    flexShrink: 0,
    "&.MuiChip-clickable:hover, &.MuiChip-clickable:focus-visible": restingStyles,
  };
}
