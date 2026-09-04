import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import theme from "./theme";
import { LocationProvider } from "./context/LocationContext";
import { UserDataProvider } from "./context/UserDataContext";
import BottomNav from "./components/layout/BottomNav";
import MapPage from "./pages/MapPage";
import SavedPage from "./pages/SavedPage";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocationProvider>
        <UserDataProvider>
          <BrowserRouter>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
              <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <Routes>
                  <Route path="/" element={<MapPage />} />
                  <Route path="/saved" element={<SavedPage />} />
                </Routes>
              </Box>
              <BottomNav />
            </Box>
          </BrowserRouter>
        </UserDataProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}
