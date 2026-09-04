import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import theme from "./theme";
import { LocationProvider } from "./context/LocationContext";
import { UserDataProvider } from "./context/UserDataContext";
import MapPage from "./pages/MapPage";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocationProvider>
        <UserDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MapPage />} />
            </Routes>
          </BrowserRouter>
        </UserDataProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}
