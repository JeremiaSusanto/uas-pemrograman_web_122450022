import { useState, useEffect } from "react";

const JadwalForm = ({ onSubmit, initialData, isEdit = false, plantOptions = [] }) => {
  const data = initialData || {}; // fallback jika null
  const [namaTanaman, setNamaTanaman] = useState(data.nama_tanaman || "");
  const [jenisPerawatan, setJenisPerawatan] = useState(data.jenis_perawatan || "");
  const [tanggal, setTanggal] = useState(data.tanggal || "");
  const [catatan, setCatatan] = useState(data.catatan || "");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Care type options with icons
  const careTypes = [
    { value: "penyiraman", label: "Penyiraman", icon: "💧", color: "blue" },
    { value: "pemupukan", label: "Pemupukan", icon: "🌱", color: "green" },
    { value: "pemangkasan", label: "Pemangkasan", icon: "✂️", color: "orange" },
    { value: "penggantian_pot", label: "Penggantian Pot", icon: "🪴", color: "purple" },
    { value: "pembersihan", label: "Pembersihan", icon: "🧹", color: "teal" },
    { value: "penyemprotan", label: "Penyemprotan", icon: "💨", color: "indigo" },
    { value: "lainnya", label: "Lainnya", icon: "📝", color: "gray" }
  ];

  useEffect(() => {
    if (initialData) {
      setNamaTanaman(initialData.nama_tanaman || "");
      setJenisPerawatan(initialData.jenis_perawatan || "");
      setTanggal(initialData.tanggal || "");
      setCatatan(initialData.catatan || "");
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!namaTanaman.trim()) {
      newErrors.namaTanaman = "Nama tanaman harus dipilih";
    }
    
    if (!jenisPerawatan) {
      newErrors.jenisPerawatan = "Jenis perawatan harus dipilih";
    }
    
    if (!tanggal) {
      newErrors.tanggal = "Tanggal harus diisi";
    } else {
      const selectedDate = new Date(tanggal);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.tanggal = "Tanggal tidak boleh kurang dari hari ini";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const scheduleData = {
        id: initialData?.id || Date.now(),
        nama_tanaman: namaTanaman.trim(),
        jenis_perawatan: jenisPerawatan,
        tanggal: tanggal,
        catatan: catatan.trim(),
      };

      await onSubmit(scheduleData);

      if (!isEdit) {
        setNamaTanaman("");
        setJenisPerawatan("");
        setTanggal("");
        setCatatan("");
        setErrors({});
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedCareType = () => {
    return careTypes.find(type => type.value === jenisPerawatan);
  };
  return (
    <div className="bg-gradient-to-br from-white via-yellow-50 to-orange-50 p-8 rounded-2xl shadow-xl border border-yellow-100 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
          <span className="text-white text-xl">📅</span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-orange-600 bg-clip-text text-transparent">
          {isEdit ? "Edit Jadwal Perawatan" : "Buat Jadwal Perawatan Baru"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Tanaman */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-green-600">🌿</span>
            Nama Tanaman
          </label>
          <div className="relative">
            {plantOptions.length > 0 ? (
              <select
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  errors.namaTanaman 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-white focus:border-green-400 hover:border-green-300'
                }`}
                value={namaTanaman}
                onChange={(e) => {
                  setNamaTanaman(e.target.value);
                  if (errors.namaTanaman) setErrors({...errors, namaTanaman: ''});
                }}
              >
                <option value="">Pilih tanaman...</option>
                {plantOptions.map((plant, index) => (
                  <option key={index} value={plant.nama || plant}>
                    {plant.nama || plant} {plant.jenis ? `(${plant.jenis})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 ${
                  errors.namaTanaman 
                    ? 'border-red-300 bg-red-50 focus:border-red-500' 
                    : 'border-gray-200 bg-white focus:border-green-400 hover:border-green-300'
                }`}
                value={namaTanaman}
                onChange={(e) => {
                  setNamaTanaman(e.target.value);
                  if (errors.namaTanaman) setErrors({...errors, namaTanaman: ''});
                }}
                placeholder="Masukkan nama tanaman..."
              />
            )}
          </div>
          {errors.namaTanaman && <p className="text-red-500 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.namaTanaman}
          </p>}
        </div>

        {/* Jenis Perawatan */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-blue-600">🔧</span>
            Jenis Perawatan
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {careTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setJenisPerawatan(type.value);
                  if (errors.jenisPerawatan) setErrors({...errors, jenisPerawatan: ''});
                }}
                className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 text-sm font-medium ${
                  jenisPerawatan === type.value
                    ? `border-${type.color}-400 bg-${type.color}-50 text-${type.color}-700 shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                <span className="text-xs text-center">{type.label}</span>
              </button>
            ))}
          </div>
          {errors.jenisPerawatan && <p className="text-red-500 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.jenisPerawatan}
          </p>}
        </div>

        {/* Tanggal */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-purple-600">📅</span>
            Tanggal Perawatan
          </label>
          <input
            type="date"
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
              errors.tanggal 
                ? 'border-red-300 bg-red-50 focus:border-red-500' 
                : 'border-gray-200 bg-white focus:border-purple-400 hover:border-purple-300'
            }`}
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              if (errors.tanggal) setErrors({...errors, tanggal: ''});
            }}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.tanggal && <p className="text-red-500 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.tanggal}
          </p>}
        </div>

        {/* Catatan */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-indigo-600">📝</span>
            Catatan (Opsional)
          </label>
          <textarea
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 hover:border-indigo-300 bg-white resize-none"
            rows="3"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tambahkan catatan khusus untuk perawatan ini..."
            maxLength="200"
          />
          <div className="text-xs text-gray-500 text-right">
            {catatan.length}/200 karakter
          </div>
        </div>

        {/* Preview Card */}
        {(namaTanaman || jenisPerawatan || tanggal) && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span>👁️</span> Preview Jadwal
            </h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Tanaman:</span> {namaTanaman || "Belum dipilih"}</p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Perawatan:</span> 
                {getSelectedCareType() ? (
                  <>
                    <span>{getSelectedCareType().icon}</span>
                    <span>{getSelectedCareType().label}</span>
                  </>
                ) : "Belum dipilih"}
              </p>
              <p><span className="font-medium">Tanggal:</span> {tanggal || "Belum dipilih"}</p>
              {catatan && <p><span className="font-medium">Catatan:</span> {catatan}</p>}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
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
              {isEdit ? "Simpan Perubahan" : "Buat Jadwal"}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default JadwalForm;
