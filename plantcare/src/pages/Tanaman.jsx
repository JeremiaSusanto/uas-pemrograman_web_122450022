
import { useState, useEffect, useCallback, useMemo } from "react";
import TanamanForm from "../components/TanamanForm";
import TanamanCard from "../components/TanamanCard";
import {
  getTanamanList,
  createTanaman,
  updateTanaman,
  deleteTanaman,
} from "../api/plantApi";

// Debounce hook for search optimization
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Tanaman = () => {
  const [tanamanList, setTanamanList] = useState([]);
  const [filteredTanaman, setFilteredTanaman] = useState([]);
  const [editingTanaman, setEditingTanaman] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("all");
  const [sortBy, setSortBy] = useState("nama");
  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({ limit: 12, offset: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Debounce search term to reduce filtering frequency
  const debouncedSearchTerm = useDebounce(searchTerm, 300);



  // Optimized filtering function with better performance
  const filterAndSortTanaman = useCallback(() => {
    let filtered = [...tanamanList];

    // Filter by search term (using debounced value)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(tanaman =>
        tanaman.nama.toLowerCase().includes(searchLower) ||
        tanaman.jenis.toLowerCase().includes(searchLower) ||
        tanaman.lokasi.toLowerCase().includes(searchLower)
      );
    }

    // Filter by jenis
    if (filterJenis !== "all") {
      filtered = filtered.filter(tanaman => tanaman.jenis === filterJenis);
    }

    // Sort with optimized comparison
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nama":
          return a.nama.localeCompare(b.nama);
        case "jenis":
          return a.jenis.localeCompare(b.jenis);
        case "lokasi":
          return a.lokasi.localeCompare(b.lokasi);
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

    setFilteredTanaman(filtered);
  }, [tanamanList, debouncedSearchTerm, filterJenis, sortBy]);

  useEffect(() => {
    fetchTanaman(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  useEffect(() => {
    filterAndSortTanaman();
  }, [tanamanList, debouncedSearchTerm, filterJenis, sortBy, filterAndSortTanaman]);

  // Memoize unique jenis list to prevent recalculation
  const uniqueJenis = useMemo(() => {
    const jenisList = [...new Set(tanamanList.map(tanaman => tanaman.jenis))];
    return jenisList.sort();
  }, [tanamanList]);

  const fetchTanaman = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const offset = (page - 1) * pageSize;
      const { tanaman, pagination: pag } = await getTanamanList({ limit: pageSize, offset });
      setTanamanList(tanaman);
      setPagination(pag);
    } catch (err) {
      setError("Gagal mengambil data tanaman");
    } finally {
      setLoading(false);
    }
  }, []);
  // Pagination controls
  const totalPages = Math.ceil((pagination?.total || 0) / pageSize);
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchTanaman(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  useEffect(() => {
    filterAndSortTanaman();
  }, [tanamanList, debouncedSearchTerm, filterJenis, sortBy, filterAndSortTanaman]);

  const getUniqueJenis = () => uniqueJenis;

  const handleAddOrEdit = async (data) => {
    setError("");
    try {
      if (editingTanaman) {
        await updateTanaman(data.id, data);
        setEditingTanaman(null);
      } else {
        await createTanaman(data);
      }
      fetchTanaman();
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Gagal menyimpan data");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus tanaman ini?")) {
      return;
    }
    
    setError("");
    try {
      await deleteTanaman(id);
      fetchTanaman();
    } catch (err) {
      setError(err.message || "Gagal menghapus data");
    }
  };

  const handleEdit = (item) => {
    setEditingTanaman(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-green-800 mb-2 flex items-center">
            🌱 Koleksi Tanaman
          </h1>
          <p className="text-gray-600 text-lg">
            Kelola dan pantau koleksi tanaman Anda ({filteredTanaman.length} dari {tanamanList.length} tanaman)
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingTanaman(null);
          }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 
            hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium 
            transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl 
            flex items-center space-x-2"
        >
          <span className="text-xl">{showForm ? "✕" : "+"}</span>
          <span>{showForm ? "Batal" : "Tambah Tanaman"}</span>
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="mb-8 animate-slide-down">
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-green-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">{editingTanaman ? "📝" : "🌱"}</span>
              {editingTanaman ? "Edit Tanaman" : "Tambah Tanaman Baru"}
            </h2>
            <TanamanForm
              onSubmit={handleAddOrEdit}
              initialData={editingTanaman}
              isEdit={!!editingTanaman}
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
              placeholder="Cari tanaman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-green-500 focus:border-transparent 
                transition-all duration-200"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* Filter by Jenis */}
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 focus:border-transparent 
              transition-all duration-200"
          >
            <option value="all">Semua Jenis</option>
            {getUniqueJenis().map(jenis => (
              <option key={jenis} value={jenis}>{jenis}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 focus:border-transparent 
              transition-all duration-200"
          >
            <option value="nama">Urutkan: Nama</option>
            <option value="jenis">Urutkan: Jenis</option>
            <option value="lokasi">Urutkan: Lokasi</option>
            <option value="newest">Urutkan: Terbaru</option>
            <option value="oldest">Urutkan: Terlama</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredTanaman.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌿</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">
            {searchTerm || filterJenis !== "all" ? "Tidak ada tanaman yang sesuai" : "Belum ada tanaman"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterJenis !== "all" 
              ? "Coba ubah kata kunci pencarian atau filter"
              : "Mulai dengan menambahkan tanaman pertama Anda"}
          </p>
          {(!searchTerm && filterJenis === "all") && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 
                rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              + Tambah Tanaman Pertama
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"}>
            {filteredTanaman.map((tanaman, index) => (
              <div
                key={tanaman.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TanamanCard
                  tanaman={tanaman}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  viewMode={viewMode}
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

export default Tanaman;
