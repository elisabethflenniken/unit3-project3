import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RatingStars from "./RatingStars";
import type { Restroom, RatingKey } from "../../types/restroom";
import { useUserData } from "../../context/UserDataContext";

const DIMENSIONS: { key: RatingKey; label: string }[] = [
  { key: "cleanliness", label: "Clean" },
  { key: "safety", label: "Safety" },
  { key: "privacy", label: "Privacy" },
];

export default function RateRestroomForm({ restroom }: { restroom: Restroom }) {
  const { submitRating, myRatingFor } = useUserData();
  const myRating = myRatingFor(restroom.id);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {DIMENSIONS.map(({ key, label }) => (
        <RatingStars
          key={key}
          label={label}
          average={restroom.ratings[key].average}
          count={restroom.ratings[key].count}
          interactive
          myValue={myRating[key]}
          onChange={(value) => submitRating(restroom.id, key, value)}
        />
      ))}
      {Object.keys(myRating).length > 0 && (
        <Typography variant="caption" sx={{ color: "success.main" }}>
          Thanks for rating this spot.
        </Typography>
      )}
    </Box>
  );
}
