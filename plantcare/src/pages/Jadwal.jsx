
import { useState, useEffect, useCallback } from "react";
import JadwalCard from "../components/JadwalCard";
import JadwalForm from "../components/JadwalForm";
import {
  getJadwalList,
  createJadwal,
  updateJadwal,
  deleteJadwal,
} from "../api/jadwalApi";


const Jadwal = () => {
  const [jadwalList, setJadwalList] = useState([]);
  const [filteredJadwal, setFilteredJadwal] = useState([]);
  const [pagination, setPagination] = useState({ limit: 12, offset: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, today, upcoming, overdue
  const [sortBy, setSortBy] = useState("tanggal"); // tanggal, nama_tanaman, jenis_perawatan
  const [viewMode, setViewMode] = useState("grid"); // grid, list, calendar
  useEffect(() => {
    fetchJadwal(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);


  const filterAndSortJadwal = useCallback(() => {
    let filtered = [...jadwalList];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(jadwal =>
        jadwal.nama_tanaman?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jadwal.jenis_perawatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jadwal.catatan?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(jadwal => {
        const jadwalDate = new Date(jadwal.tanggal);
        jadwalDate.setHours(0, 0, 0, 0);
        switch (filterStatus) {
          case "today":
            return jadwalDate.getTime() === today.getTime();
          case "upcoming":
            return jadwalDate.getTime() > today.getTime();
          case "overdue":
            return jadwalDate.getTime() < today.getTime();
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "tanggal":
          return new Date(a.tanggal) - new Date(b.tanggal);
        case "nama_tanaman":
          return (a.nama_tanaman || "").localeCompare(b.nama_tanaman || "");
        case "jenis_perawatan":
          return (a.jenis_perawatan || "").localeCompare(b.jenis_perawatan || "");
        default:
          return 0;
      }
    });

    setFilteredJadwal(filtered);
  }, [jadwalList, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    filterAndSortJadwal();
  }, [jadwalList, searchTerm, filterStatus, sortBy, filterAndSortJadwal]);

  const getScheduleStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = jadwalList.filter(jadwal => {
      const jadwalDate = new Date(jadwal.tanggal);
      jadwalDate.setHours(0, 0, 0, 0);
      return jadwalDate.getTime() === today.getTime();
    }).length;

    const upcomingCount = jadwalList.filter(jadwal => {
      const jadwalDate = new Date(jadwal.tanggal);
      jadwalDate.setHours(0, 0, 0, 0);
      return jadwalDate.getTime() > today.getTime();
    }).length;

    const overdueCount = jadwalList.filter(jadwal => {
      const jadwalDate = new Date(jadwal.tanggal);
      jadwalDate.setHours(0, 0, 0, 0);
      return jadwalDate.getTime() < today.getTime();
    }).length;

    return { todayCount, upcomingCount, overdueCount };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jadwalDate = new Date(date);
    jadwalDate.setHours(0, 0, 0, 0);
    
    if (jadwalDate.getTime() === today.getTime()) {
      return "Hari ini";
    } else if (jadwalDate.getTime() === today.getTime() + 86400000) {
      return "Besok";
    } else {
      return date.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const fetchJadwal = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const offset = (page - 1) * pageSize;
      const { jadwal, pagination: pag } = await getJadwalList({ limit: pageSize, offset });
      setJadwalList(jadwal);
      setPagination(pag);
    } catch (err) {
      setError("Gagal mengambil data jadwal");
    } finally {
      setLoading(false);
    }
  };
  // Pagination controls
  const totalPages = Math.ceil((pagination?.total || 0) / pageSize);
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleTambah = async (jadwalBaru) => {
    setError("");
    try {
      await createJadwal(jadwalBaru);
      fetchJadwal();
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Gagal menambah jadwal");
    }
  };
  const handleEdit = async (updatedJadwal) => {
    setError("");
    try {
      // For edit: use the existing ID from editData
      await updateJadwal(editData.id, updatedJadwal);
      fetchJadwal();
      setEditData(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Gagal mengupdate jadwal");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      return;
    }
    
    setError("");
    try {
      await deleteJadwal(id);
      fetchJadwal();
    } catch (err) {
      setError(err.message || "Gagal menghapus jadwal");
    }
  };

  const { todayCount, upcomingCount, overdueCount } = getScheduleStats();

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          </div>
        ))}
      </div>
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 
            bg-clip-text text-transparent mb-2">
            📅 Jadwal Perawatan
          </h1>
          <p className="text-gray-600">Kelola jadwal perawatan tanaman Anda dengan mudah</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditData(null);
          }}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 
            hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium 
            transition-all duration-300 transform hover:scale-105 shadow-lg 
            hover:shadow-xl flex items-center gap-2"
        >
          {showForm ? (
            <>
              <span>❌</span>
              Batal
            </>
          ) : (
            <>
              <span>➕</span>
              Tambah Jadwal
            </>
          )}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Hari Ini</h3>
              <p className="text-3xl font-bold">{todayCount}</p>
            </div>
            <div className="text-4xl opacity-80">📋</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Mendatang</h3>
              <p className="text-3xl font-bold">{upcomingCount}</p>
            </div>
            <div className="text-4xl opacity-80">⏰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Terlewat</h3>
              <p className="text-3xl font-bold">{overdueCount}</p>
            </div>
            <div className="text-4xl opacity-80">⚠️</div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">
              {editData ? "✏️" : "➕"}
            </span>
            <h2 className="text-2xl font-bold text-gray-800">
              {editData ? "Edit Jadwal" : "Tambah Jadwal Baru"}
            </h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <JadwalForm
              onSubmit={editData ? handleEdit : handleTambah}
              initialData={editData}
              isEdit={!!editData}
            />
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari jadwal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-green-500 focus:border-transparent 
                transition-all duration-200"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 focus:border-transparent 
              transition-all duration-200"
          >
            <option value="all">Semua Status</option>
            <option value="today">Hari Ini</option>
            <option value="upcoming">Mendatang</option>
            <option value="overdue">Terlewat</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 focus:border-transparent 
              transition-all duration-200"
          >
            <option value="tanggal">Urutkan: Tanggal</option>
            <option value="nama_tanaman">Urutkan: Nama Tanaman</option>
            <option value="jenis_perawatan">Urutkan: Jenis Perawatan</option>
          </select>

          {/* View Mode */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === "grid" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📱 Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                viewMode === "list" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 
          animate-slide-down shadow-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Content Section */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredJadwal.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">
            {searchTerm || filterStatus !== "all" ? "Tidak ada jadwal yang sesuai" : "Belum ada jadwal"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterStatus !== "all" 
              ? "Coba ubah kata kunci pencarian atau filter"
              : "Mulai dengan menambahkan jadwal perawatan pertama Anda"}
          </p>
          {(!searchTerm && filterStatus === "all") && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 
                rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              ➕ Tambah Jadwal Pertama
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"}>
            {filteredJadwal.map((jadwal, index) => (
              <div
                key={jadwal.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <JadwalCard
                  jadwal={jadwal}
                  onEdit={() => {
                    setEditData(jadwal);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDelete(jadwal.id)}
                  viewMode={viewMode}
                  formatDate={formatDate}
                />
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                &laquo; Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg ${page === currentPage ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jadwal;
