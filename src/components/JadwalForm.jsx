import { useState } from "react";

const JadwalForm = ({ onSubmit, initialData, isEdit = false }) => {
  const data = initialData || {}; // fallback jika null
  const [namaTanaman, setNamaTanaman] = useState(data.namaTanaman || "");
  const [kegiatan, setKegiatan] = useState(data.kegiatan || "");
  const [tanggal, setTanggal] = useState(data.tanggal || "");


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaTanaman || !kegiatan || !tanggal) return;
    onSubmit({ id: initialData?.id || Date.now(), namaTanaman, kegiatan, tanggal });

    if (!isEdit) {
      setNamaTanaman("");
      setKegiatan("");
      setTanggal("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-yellow-700">
        {isEdit ? "Edit Jadwal" : "Tambah Jadwal"}
      </h2>

      <div>
        <label className="block text-sm text-gray-700">Nama Tanaman</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mt-1"
          value={namaTanaman}
          onChange={(e) => setNamaTanaman(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Kegiatan</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mt-1"
          value={kegiatan}
          onChange={(e) => setKegiatan(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Tanggal</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2 mt-1"
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Simpan Perubahan" : "Tambah"}
      </button>
    </form>
  );
};

export default JadwalForm;
