import { useEffect, useState } from "react";

const TanamanForm = ({ onSubmit, initialData = null, isEdit = false }) => {
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState("");
  const [lokasi, setLokasi] = useState("");

  // Mengisi form saat edit
  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama || "");
      setJenis(initialData.jenis || "");
      setLokasi(initialData.lokasi || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || !jenis || !lokasi) return;

    const data = {
      id: initialData?.id || Date.now(),
      nama,
      jenis,
      lokasi,
    };

    onSubmit(data);

    if (!isEdit) {
      setNama("");
      setJenis("");
      setLokasi("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-green-700">
        {isEdit ? "Edit Tanaman" : "Tambah Tanaman"}
      </h2>

      <div>
        <label className="block text-sm text-gray-700">Nama Tanaman</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mt-1"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Jenis</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mt-1"
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Lokasi</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mt-1"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        {isEdit ? "Simpan Perubahan" : "Tambah"}
      </button>
    </form>
  );
};

export default TanamanForm;
