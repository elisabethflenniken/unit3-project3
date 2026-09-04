import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";

interface RatingStarsProps {
  label: string;
  average: number;
  count: number;
  interactive?: boolean;
  myValue?: number;
  onChange?: (value: number) => void;
}

export default function RatingStars({
  label,
  average,
  count,
  interactive = false,
  myValue,
  onChange,
}: RatingStarsProps) {
  const displayValue = interactive ? myValue ?? average : average;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{ width: 76, flexShrink: 0, color: "text.secondary", fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Rating
        value={displayValue}
        precision={interactive ? 1 : 0.5}
        readOnly={!interactive}
        emptyIcon={<StarIcon style={{ opacity: 0.25 }} fontSize="inherit" />}
        onChange={(_, value) => {
          if (value) onChange?.(value);
        }}
      />
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {count > 0 ? `${average.toFixed(1)} (${count})` : "No ratings yet"}
      </Typography>
    </Box>
  );
}
