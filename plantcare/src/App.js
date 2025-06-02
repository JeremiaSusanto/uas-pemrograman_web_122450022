// src/App.js
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Debug import for testing
import testLogin from "./debug/testLogin";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tanaman from "./pages/Tanaman";
import Jadwal from "./pages/Jadwal";
import NotFound from "./pages/NotFound";

const App = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isLoginPage = location.pathname === "/login";

  return (
    <div>
      {!isLoginPage && <Navbar />}
      <Routes>
        {/* Root redirect - redirect to dashboard if logged in, otherwise to login */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tanaman"
          element={
            <ProtectedRoute>
              <Tanaman />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jadwal"
          element={
            <ProtectedRoute>
              <Jadwal />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
