import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Dummy data sementara
  const totalTanaman = 5;
  const totalJadwalHariIni = 2;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Selamat datang di PlantCare! 🌿</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white shadow-md rounded-xl p-6 border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-700">Total Tanaman</h2>
          <p className="text-3xl font-bold text-green-700">{totalTanaman}</p>
          <Link to="/tanaman" className="text-green-600 mt-2 inline-block hover:underline">
            Lihat semua tanaman →
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 border-l-4 border-yellow-500">
          <h2 className="text-lg font-semibold text-gray-700">Jadwal Hari Ini</h2>
          <p className="text-3xl font-bold text-yellow-700">{totalJadwalHariIni}</p>
          <Link to="/jadwal" className="text-yellow-600 mt-2 inline-block hover:underline">
            Cek jadwal perawatan →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
