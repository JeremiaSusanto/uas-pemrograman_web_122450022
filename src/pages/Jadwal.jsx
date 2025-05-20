import { useState } from "react";
import JadwalCard from "../components/JadwalCard";
import JadwalForm from "../components/JadwalForm";

const Jadwal = () => {
  const [jadwalList, setJadwalList] = useState([
    {
      id: 1,
      namaTanaman: "Monstera",
      tanggal: "2025-05-15",
      kegiatan: "Penyiraman",
    },
    {
      id: 2,
      namaTanaman: "Lidah Mertua",
      tanggal: "2025-05-16",
      kegiatan: "Pemupukan",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const handleTambah = (jadwalBaru) => {
    setJadwalList([...jadwalList, jadwalBaru]);
    setShowForm(false);
  };

  const [editData, setEditData] = useState(null);

  const handleEdit = (updatedJadwal) => {
  const updatedList = jadwalList.map((item) =>
    item.id === updatedJadwal.id ? updatedJadwal : item
  );
  setJadwalList(updatedList);
  setEditData(null);
  setShowForm(false);
};

  return (
    <div className="p-6">
      {/* Header & Tombol Tambah */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Jadwal Perawatan</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          {showForm ? "Batal" : "+ Tambah Jadwal"}
        </button>
      </div>

      {/* Form Tambah */}
      {showForm && (
          <div className="mb-6">
            <JadwalForm
              onSubmit={editData ? handleEdit : handleTambah}
              initialData={editData}
              isEdit={!!editData}
            />
          </div>
        )}


      {/* Daftar Jadwal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jadwalList.map((jadwal) => (
            <JadwalCard
            key={jadwal.id}
            jadwal={jadwal}
            onEdit={() => {
            setEditData(jadwal);
            setShowForm(true);
        }}
        />
        ))}

      </div>
    </div>
  );
};

export default Jadwal;
