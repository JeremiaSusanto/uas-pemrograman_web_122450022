import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDashboardSummary } from '../api/dashboardApi';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Optimized fetch function with caching
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    // Check if we have recent data (within 60 seconds) and don't force refresh
    const now = Date.now();
    if (!forceRefresh && lastFetchTime && (now - lastFetchTime) < 60000 && dashboardData) {
      console.log('Using cached dashboard data');
      return;
    }

    try {
      setLoading(!dashboardData); // Only show loading if no data exists
      const data = await getDashboardSummary();
      
      if (data.error) {
        setError(data.error);
      } else {
        setDashboardData(data);
        setError(null);
        setLastFetchTime(now);
        
        // Cache data in localStorage for offline access
        localStorage.setItem('dashboardCache', JSON.stringify({
          data,
          timestamp: now
        }));
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
      
      // Try to load from cache if available
      const cached = localStorage.getItem('dashboardCache');
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // Use cache if it's less than 5 minutes old
          if (now - timestamp < 300000) {
            setDashboardData(data);
            setError('Using cached data - connection issues');
          }
        } catch (parseErr) {
          console.error('Cache parse error:', parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime, dashboardData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
    setRefreshing(false);
  }, [fetchDashboardData]);

  // Initial load and smart refresh
  useEffect(() => {
    // Load from cache immediately for better UX
    const cached = localStorage.getItem('dashboardCache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Use cache if it's less than 5 minutes old
        if (Date.now() - timestamp < 300000) {
          setDashboardData(data);
          setLoading(false);
          setLastFetchTime(timestamp);
        }
      } catch (parseErr) {
        console.error('Cache parse error:', parseErr);
      }
    }

    fetchDashboardData();

    // Reduced auto-refresh interval and more intelligent refresh
    const interval = setInterval(() => {
      // Only auto-refresh if page is visible and no manual operations are happening
      if (document.visibilityState === 'visible' && !refreshing) {
        fetchDashboardData();
      }
    }, 120000); // Increased to 2 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData, refreshing]);

  // Memoized stats calculations to prevent unnecessary re-renders
  const statsData = useMemo(() => {
    if (!dashboardData) return null;

    return [
      {
        title: 'Total Tanaman',
        value: dashboardData.totalTanaman || 0,
        icon: '🌱',
        color: 'bg-green-500',
        change: '+12%',
        description: 'Tanaman yang terdaftar'
      },
      {
        title: 'Total Jadwal',
        value: dashboardData.totalJadwal || 0,
        icon: '📅',
        color: 'bg-blue-500',
        change: '+8%',
        description: 'Jadwal perawatan'
      },
      {
        title: 'Jadwal Hari Ini',
        value: dashboardData.totalJadwalHariIni || 0,
        icon: '⏰',
        color: 'bg-orange-500',
        change: dashboardData.totalJadwalHariIni > 0 ? 'Ada tugas!' : 'Tidak ada',
        description: 'Perlu perhatian hari ini'
      }
    ];
  }, [dashboardData]);

  // Performance monitoring display
  const performanceInfo = useMemo(() => {
    if (!dashboardData?.systemStatus) return null;
    
    return {
      queryTime: dashboardData.systemStatus.queryTime || 'unknown',
      status: dashboardData.systemStatus.status || 'unknown',
      version: dashboardData.systemStatus.version || '1.0.0'
    };
  }, [dashboardData]);

  // Loading skeleton component with better animations
  const LoadingSkeleton = () => (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !dashboardData) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      {/* Header Section with Performance Info */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-green-800 mb-2 animate-fade-in">
            Selamat datang di PlantCare! 🌿
          </h1>
          <p className="text-gray-600 text-lg">
            Kelola tanaman Anda dengan mudah dan efektif
          </p>
          {performanceInfo && (
            <div className="text-sm text-gray-500 mt-1">
              Query time: {performanceInfo.queryTime} | Status: {performanceInfo.status}
              {lastFetchTime && (
                <span className="ml-2">
                  Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
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
              <p className="font-semibold">Peringatan</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 
                transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.color} text-white text-2xl`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="text-sm text-green-600 font-medium">{stat.change}</div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{stat.title}</h3>
                <p className="text-gray-600 text-sm">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Plants */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🌱</span>
            Tanaman Terbaru
          </h2>
          {dashboardData?.recentPlants?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentPlants.map((plant, index) => (
                <div
                  key={plant.id || index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 
                    transition-colors duration-200 border border-gray-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center 
                    justify-center mr-3">
                    <span className="text-green-600 font-semibold">
                      {plant.nama ? plant.nama.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800">{plant.nama || 'Unknown'}</h3>
                    <p className="text-sm text-gray-600">
                      {plant.jenis || 'Unknown type'} • {plant.lokasi || 'Unknown location'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {plant.created_at ? new Date(plant.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">🌱</span>
              <p>Belum ada tanaman yang ditambahkan</p>
            </div>
          )}
        </div>

        {/* Upcoming Schedules */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Jadwal Mendatang
          </h2>
          {dashboardData?.upcomingSchedules?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingSchedules.map((schedule, index) => (
                <div
                  key={schedule.id || index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 
                    transition-colors duration-200 border border-gray-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center 
                    justify-center mr-3">
                    <span className="text-blue-600 text-sm font-semibold">
                      {schedule.tanggal ? new Date(schedule.tanggal).getDate() : '?'}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800">{schedule.namaTanaman || 'Unknown plant'}</h3>
                    <p className="text-sm text-gray-600">{schedule.kegiatan || 'Unknown activity'}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {schedule.tanggal ? new Date(schedule.tanggal).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📅</span>
              <p>Tidak ada jadwal mendatang</p>
            </div>
          )}
        </div>
      </div>

      {/* Plant Statistics */}
      {dashboardData?.plantStats?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Statistik Tanaman
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.plantStats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="text-2xl font-bold text-green-600">
                  {stat.jumlah || 0}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {stat.jenis || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      {dashboardData?.systemStatus && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                System Online
              </span>
              <span>Version {dashboardData.systemStatus.version}</span>
              {dashboardData.systemStatus.weather && (
                <span>
                  {dashboardData.systemStatus.weather.temperature}°C • 
                  {dashboardData.systemStatus.weather.humidity}% humidity
                </span>
              )}
            </div>
            <div className="text-xs">
              Performance: {performanceInfo?.queryTime}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
