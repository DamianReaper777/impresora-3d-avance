import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import PrintersPage from "./pages/PrintersPage";
import PrinterDetailsPage from "./pages/PrinterDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<PrintersPage />}
        />

        <Route
          path="/printers/:id"
          element={<PrinterDetailsPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;