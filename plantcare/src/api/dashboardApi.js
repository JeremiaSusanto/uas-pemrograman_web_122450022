// Dashboard API client for PlantCare application
const API_BASE = 'http://localhost:6543/dashboard';

export async function getDashboardSummary() {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dashboard API response:', data);
    
    return {
      totalTanaman: data.totalTanaman || 0,
      totalJadwal: data.totalJadwal || 0,
      totalJadwalHariIni: data.totalJadwalHariIni || 0,
      recentPlants: data.recentPlants || [],
      upcomingSchedules: data.upcomingSchedules || [],
      plantStats: data.plantStats || [],
      systemStatus: data.systemStatus || {}
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    // Return fallback data if API fails
    return {
      totalTanaman: 0,
      totalJadwal: 0,
      totalJadwalHariIni: 0,
      recentPlants: [],
      upcomingSchedules: [],
      plantStats: [],
      systemStatus: { status: 'offline' },
      error: error.message
    };
  }
}
