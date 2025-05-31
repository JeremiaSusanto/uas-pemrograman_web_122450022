import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import plantcareImage from '../images/plantcare.png';
import { useAuth } from "../context/AuthContext";


const Navbar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/tanaman", label: "Tanaman", icon: "🌿" },
    { path: "/jadwal", label: "Jadwal", icon: "📅" }
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <img 
                src={plantcareImage} 
                alt="PlantCare Logo" 
                className="w-10 h-10 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-200" 
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                PlantCare
              </span>
              <div className="text-xs text-gray-500 -mt-1">Plant Management</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(item.path)
                    ? "bg-green-100 text-green-700 shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Section & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* User Info (Desktop) */}            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Halo, {user?.username || "Pengguna"}
                </div>
                <div className="text-xs text-gray-500">Selamat datang kembali</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                {(user?.username || "U").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Logout Button (Desktop) */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <svg 
                className={`w-6 h-6 transform transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 animate-slide-down">
            <div className="space-y-2">
              {/* User Info (Mobile) */}
              <div className="px-4 py-3 bg-gray-50 rounded-xl mx-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {(user || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Halo, {user || "Pengguna"}
                    </div>
                    <div className="text-sm text-gray-500">Selamat datang kembali</div>
                  </div>
                </div>
              </div>

              {/* Navigation Items (Mobile) */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                    isActive(item.path)
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {/* Logout Button (Mobile) */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 mx-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center gap-3 border border-red-200 mt-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
