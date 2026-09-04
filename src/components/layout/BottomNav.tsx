import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MapIcon from "@mui/icons-material/Map";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useLocation, useNavigate } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const value = location.pathname.startsWith("/saved") ? "/saved" : "/";

  return (
    <Paper
      elevation={3}
      square
      sx={{ pb: "env(safe-area-inset-bottom)", zIndex: 1200, flexShrink: 0 }}
    >
      <BottomNavigation value={value} onChange={(_, next) => navigate(next)} showLabels>
        <BottomNavigationAction label="Map" value="/" icon={<MapIcon />} />
        <BottomNavigationAction label="Saved" value="/saved" icon={<FavoriteIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
