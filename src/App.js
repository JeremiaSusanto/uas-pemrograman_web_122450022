// src/App.js
import { useLocation, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tanaman from "./pages/Tanaman";
import Jadwal from "./pages/Jadwal";
import NotFound from "./pages/NotFound";

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div>
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tanaman" element={<Tanaman />} />
        <Route path="/jadwal" element={<Jadwal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
