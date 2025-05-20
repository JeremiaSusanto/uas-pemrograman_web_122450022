const JadwalCard = ({ jadwal, onEdit }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg border-l-4 border-yellow-500">
      <h2 className="text-lg font-semibold text-green-800">{jadwal.namaTanaman}</h2>
      <p className="text-sm text-gray-600">Kegiatan: {jadwal.kegiatan}</p>
      <p className="text-sm text-gray-500">Tanggal: {jadwal.tanggal}</p>
      <button
        onClick={onEdit}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        Edit
      </button>
    </div>
  );
};
export default JadwalCard;