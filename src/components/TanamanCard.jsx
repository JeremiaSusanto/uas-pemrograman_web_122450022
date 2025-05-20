const TanamanCard = ({ tanaman }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg border-l-4 border-green-400">
      <h2 className="text-xl font-semibold text-green-800">{tanaman.nama}</h2>
      <p className="text-sm text-gray-600">Jenis: {tanaman.jenis}</p>
      <p className="text-sm text-gray-600">Lokasi: {tanaman.lokasi}</p>
      <button className="mt-3 text-sm text-blue-600 hover:underline">Edit</button>
    </div>
  );
};

export default TanamanCard;
