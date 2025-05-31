// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!username.trim()) {
      setError("Nama pengguna tidak boleh kosong");
      return;
    }
    
    if (!password) {
      setError("Password tidak boleh kosong");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Nama pengguna atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-10 w-18 h-18 bg-yellow-300 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main login card */}
        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
          {/* Logo and welcome section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl">🌿</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              PlantCare
            </h1>
            <p className="text-gray-600">Selamat datang kembali!</p>
            <p className="text-sm text-gray-500">Masuk untuk mengelola tanaman Anda</p>
          </div>          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pengguna
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-green-500 focus:border-transparent 
                    transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Masukkan nama pengguna..."
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading}
                  autoComplete="username"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-xl 
                    focus:ring-2 focus:ring-green-500 focus:border-transparent 
                    transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl 
                flex items-center gap-2 animate-slide-down">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 
                hover:from-green-700 hover:to-green-800 text-white py-3 px-6 
                rounded-xl font-medium transition-all duration-300 transform 
                hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
                disabled:transform-none shadow-lg hover:shadow-xl
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Masuk...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk
                </>
              )}
            </button>
          </form>          {/* Additional info */}
          <div className="mt-8 text-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
            
            {/* Demo credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center justify-center gap-2">
                <span>🔐</span> Akun Demo
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> sainsdata</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500">
              Kelola koleksi tanaman Anda dengan mudah
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
              <span>🌱</span>
              <span>Pantau jadwal perawatan</span>
              <span>•</span>
              <span>Catat pertumbuhan</span>
              <span>🌿</span>
            </div>
          </div>
        </div>

        {/* Footer features */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-xs text-gray-600">Dashboard Interaktif</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl">
            <div className="text-2xl mb-1">📅</div>
            <p className="text-xs text-gray-600">Jadwal Otomatis</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-2xl">
            <div className="text-2xl mb-1">🌿</div>
            <p className="text-xs text-gray-600">Koleksi Tanaman</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
