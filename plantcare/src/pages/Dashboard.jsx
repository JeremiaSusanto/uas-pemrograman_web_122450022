import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api/dashboardApi';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalTanaman: 0,
    totalJadwal: 0,
    totalJadwalHariIni: 0,
    recentPlants: [],
    upcomingSchedules: [],
    plantStats: [],
    systemStatus: {}
  });
  const [loading, setLoading] = useState(true);  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchDashboardData = async (force = false) => {
    try {
      // Prevent too frequent requests (debouncing)
      const now = Date.now();
      if (!force && lastFetch && (now - lastFetch) < 5000) {
        return; // Skip if last fetch was less than 5 seconds ago
      }
      
      setLoading(true);
      const data = await getDashboardSummary();
      setDashboardData(data);
      setLastFetch(now);
      
      if (data.error) {
        setError(data.error);
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true); // Force refresh
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData(true);
    // Reduced auto-refresh to every 2 minutes for better performance
    const interval = setInterval(() => fetchDashboardData(false), 120000);
    return () => clearInterval(interval);
  }, []);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && !refreshing) {
    return <LoadingSkeleton />;
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-green-800 mb-2 animate-fade-in">
            Selamat datang di PlantCare! 🌿
          </h1>
          <p className="text-gray-600 text-lg">
            Kelola tanaman Anda dengan mudah dan efektif
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
            transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 
            focus:ring-green-500 focus:ring-offset-2 ${refreshing ? 'animate-spin' : ''}`}
        >
          {refreshing ? '⟳' : '🔄'} Refresh
        </button>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 rounded-lg mb-6 
          animate-slide-down shadow-md">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <div>
              <strong>Warning:</strong> {error}. Menampilkan data terbatas.
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Tanaman Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-green-500 
          transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-green-600 text-3xl">🌱</div>
            <div className="text-green-600 text-sm font-medium">TANAMAN</div>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Tanaman</h2>
          <p className="text-4xl font-bold text-green-700 mb-4">{dashboardData.totalTanaman}</p>
          <Link 
            to="/tanaman" 
            className="inline-flex items-center text-green-600 hover:text-green-800 
              font-medium transition-colors duration-200 group"
          >
            Lihat semua tanaman 
            <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>

        {/* Jadwal Hari Ini Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-yellow-500 
          transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-yellow-600 text-3xl">📅</div>
            <div className="text-yellow-600 text-sm font-medium">HARI INI</div>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Jadwal Hari Ini</h2>
          <p className="text-4xl font-bold text-yellow-700 mb-4">{dashboardData.totalJadwalHariIni}</p>
          <Link 
            to="/jadwal" 
            className="inline-flex items-center text-yellow-600 hover:text-yellow-800 
              font-medium transition-colors duration-200 group"
          >
            Cek jadwal perawatan 
            <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>

        {/* Total Jadwal Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border-l-4 border-blue-500 
          transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="text-blue-600 text-3xl">📋</div>
            <div className="text-blue-600 text-sm font-medium">SEMUA</div>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Jadwal</h2>
          <p className="text-4xl font-bold text-blue-700 mb-4">{dashboardData.totalJadwal}</p>
          <Link 
            to="/jadwal" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 
              font-medium transition-colors duration-200 group"
          >
            Kelola semua jadwal 
            <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>
      </div>      {/* Two Column Layout for Recent Plants and Upcoming Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Plants */}
        {dashboardData.recentPlants && dashboardData.recentPlants.length > 0 && (
          <div className="bg-white shadow-lg rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🌱</span>
                Tanaman Terbaru
              </h2>
              <Link 
                to="/tanaman" 
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentPlants.slice(0, 3).map((plant, index) => (
                <div 
                  key={plant.id} 
                  className="group bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 
                    border border-green-100 hover:border-green-300 transition-all duration-300 
                    hover:shadow-md transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-700 
                        transition-colors duration-200">
                        {plant.nama}
                      </h3>
                      <div className="flex items-center mt-1 space-x-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                          font-medium bg-green-100 text-green-800">
                          {plant.jenis}
                        </span>
                        <span className="text-gray-600 text-sm flex items-center">
                          📍 {plant.lokasi}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-2 flex items-center">
                        <span className="mr-1">📅</span>
                        Ditambahkan: {new Date(plant.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-green-600 text-2xl opacity-70 group-hover:opacity-100 
                      transition-opacity duration-200">
                      🌿
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Schedules */}
        {dashboardData.upcomingSchedules && dashboardData.upcomingSchedules.length > 0 && (
          <div className="bg-white shadow-lg rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">⏰</span>
                Jadwal Mendatang
              </h2>
              <Link 
                to="/jadwal" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData.upcomingSchedules.slice(0, 5).map((schedule, index) => {
                const scheduleDate = new Date(schedule.tanggal);
                const isToday = scheduleDate.toDateString() === new Date().toDateString();
                const isTomorrow = scheduleDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                
                return (
                  <div 
                    key={schedule.id} 
                    className={`group p-4 rounded-xl border-l-4 transition-all duration-300 
                      hover:shadow-md transform hover:-translate-y-1 ${
                        isToday 
                          ? 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100' 
                          : isTomorrow 
                            ? 'bg-orange-50 border-orange-400 hover:bg-orange-100'
                            : 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-gray-800 group-hover:text-blue-700 
                            transition-colors duration-200">
                            {schedule.namaTanaman}
                          </span>
                          {isToday && (
                            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs 
                              rounded-full font-medium animate-pulse">
                              Hari Ini
                            </span>
                          )}
                          {isTomorrow && (
                            <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs 
                              rounded-full font-medium">
                              Besok
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm flex items-center">
                          <span className="mr-1">⚡</span>
                          {schedule.kegiatan}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500 text-sm">
                          {scheduleDate.toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>      {/* Plant Statistics */}
      {dashboardData.plantStats && dashboardData.plantStats.length > 0 && (
        <div className="bg-white shadow-lg rounded-2xl p-6 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📊</span>
            Statistik Tanaman
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.plantStats.map((stat, index) => (
              <div 
                key={index} 
                className="group bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md rounded-xl p-4 
                  text-center border border-emerald-100 hover:border-emerald-300 
                  transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-emerald-600 text-2xl mb-2 group-hover:scale-110 
                  transition-transform duration-200">
                  🌱
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-2 group-hover:text-emerald-700 
                  transition-colors duration-200">
                  {stat.jenis}
                </h3>
                <p className="text-3xl font-bold text-emerald-600 group-hover:text-emerald-700 
                  transition-colors duration-200">
                  {stat.jumlah}
                </p>
                <p className="text-gray-500 text-xs mt-1">tanaman</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">⚡</span>
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/tanaman"
            className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 
              rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 
              transform hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Tambah Tanaman</h3>
                <p className="text-green-100 text-sm">Daftarkan tanaman baru Anda</p>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                🌱
              </div>
            </div>
          </Link>
          
          <Link 
            to="/jadwal"
            className="group bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 
              rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 
              transform hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Buat Jadwal</h3>
                <p className="text-blue-100 text-sm">Atur jadwal perawatan tanaman</p>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                📅
              </div>
            </div>
          </Link>
          
          <button 
            onClick={handleRefresh}
            className="group bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 
              rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 
              transform hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Refresh Data</h3>
                <p className="text-purple-100 text-sm">Perbarui informasi terkini</p>
              </div>
              <div className={`text-3xl group-hover:scale-110 transition-transform duration-200 
                ${refreshing ? 'animate-spin' : ''}`}>
                🔄
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Data terakhir diperbarui: {new Date().toLocaleString('id-ID')}</p>
        <p className="mt-1">PlantCare - Merawat tanaman dengan lebih mudah 🌿</p>
      </div>
    </div>
  );
};

export default Dashboard;
