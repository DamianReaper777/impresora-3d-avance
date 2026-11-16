import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import PrintersPage from "./pages/PrintersPage";
import PrinterDetailsPage from "./pages/PrinterDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HistoryPage from "./pages/HistoryPage";

import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthBar from "./components/AuthBar";
import "./auth.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthBar />
        <Routes>
          <Route
            path="/"
            element={<PrintersPage />}
          />

          <Route
            path="/printers/:id"
            element={<PrinterDetailsPage />}
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/historial"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;