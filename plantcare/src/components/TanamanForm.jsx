import { useEffect, useState } from "react";

const TanamanForm = ({ onSubmit, initialData = null, isEdit = false }) => {
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Plant type suggestions
  const plantTypes = [
    "Tanaman Hias", "Sayuran", "Buah-buahan", "Herbal", "Kaktus", 
    "Sukulen", "Pohon", "Semak", "Bunga", "Tanaman Obat"
  ];

  // Location suggestions
  const locations = [
    "Ruang Tamu", "Kamar Tidur", "Dapur", "Balkon", "Teras", 
    "Halaman Depan", "Halaman Belakang", "Greenhouse", "Indoor", "Outdoor"
  ];
  // Mengisi form saat edit
  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama || "");
      setJenis(initialData.jenis || "");
      setLokasi(initialData.lokasi || "");
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!nama.trim()) {
      newErrors.nama = "Nama tanaman harus diisi";
    } else if (nama.trim().length < 2) {
      newErrors.nama = "Nama tanaman minimal 2 karakter";
    }
    
    if (!jenis.trim()) {
      newErrors.jenis = "Jenis tanaman harus diisi";
    }
    
    if (!lokasi.trim()) {
      newErrors.lokasi = "Lokasi tanaman harus diisi";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const data = {
        id: initialData?.id || Date.now(),
        nama: nama.trim(),
        jenis: jenis.trim(),
        lokasi: lokasi.trim(),
      };

      await onSubmit(data);

      if (!isEdit) {
        setNama("");
        setJenis("");
        setLokasi("");
        setErrors({});
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-gradient-to-br from-white via-green-50 to-blue-50 p-8 rounded-2xl shadow-xl border border-green-100 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">🌱</span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
          {isEdit ? "Edit Tanaman" : "Tambah Tanaman Baru"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Tanaman */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-green-600">🏷️</span>
            Nama Tanaman
          </label>
          <input
            type="text"
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
              errors.nama 
                ? 'border-red-300 bg-red-50 focus:border-red-500' 
                : 'border-gray-200 bg-white focus:border-green-400 hover:border-green-300'
            }`}
            value={nama}
            onChange={(e) => {
              setNama(e.target.value);
              if (errors.nama) setErrors({...errors, nama: ''});
            }}
            placeholder="Masukkan nama tanaman..."
          />
          {errors.nama && <p className="text-red-500 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.nama}
          </p>}
        </div>

        {/* Jenis Tanaman */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-blue-600">📋</span>
            Jenis Tanaman
          </label>
          <div className="relative">
            <input
              type="text"
              list="plant-types"
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.jenis 
                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                  : 'border-gray-200 bg-white focus:border-blue-400 hover:border-blue-300'
              }`}
              value={jenis}
              onChange={(e) => {
                setJenis(e.target.value);
                if (errors.jenis) setErrors({...errors, jenis: ''});
              }}
              placeholder="Pilih atau tulis jenis tanaman..."
            />
            <datalist id="plant-types">
              {plantTypes.map((type, index) => (
                <option key={index} value={type} />
              ))}
            </datalist>
          </div>
          {errors.jenis && <p className="text-red-500 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.jenis}
          </p>}
        </div>

        {/* Lokasi */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-purple-600">📍</span>
            Lokasi
          </label>
          <div className="relative">
            <input
              type="text"
              list="locations"
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                errors.lokasi 
                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                  : 'border-gray-200 bg-white focus:border-purple-400 hover:border-purple-300'
              }`}
              value={lokasi}
              onChange={(e) => {
                setLokasi(e.target.value);
                if (errors.lokasi) setErrors({...errors, lokasi: ''});
              }}
              placeholder="Pilih atau tulis lokasi tanaman..."
            />
            <datalist id="locations">
              {locations.map((location, index) => (
                <option key={index} value={location} />
              ))}
            </datalist>
          </div>
          {errors.lokasi && <p className="text-red-500 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.lokasi}
          </p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Menyimpan...
            </>
          ) : (
            <>
              <span>{isEdit ? "💾" : "✨"}</span>
              {isEdit ? "Simpan Perubahan" : "Tambah Tanaman"}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TanamanForm;
