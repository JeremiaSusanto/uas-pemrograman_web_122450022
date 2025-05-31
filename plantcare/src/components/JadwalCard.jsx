const JadwalCard = ({ jadwal, onDelete, onEdit, viewMode = 'grid', formatDate }) => {
  const getStatusColor = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jadwalDate = new Date(jadwal.tanggal);
    jadwalDate.setHours(0, 0, 0, 0);
    
    if (jadwalDate.getTime() === today.getTime()) {
      return "from-blue-500 to-blue-600"; // Today
    } else if (jadwalDate.getTime() > today.getTime()) {
      return "from-green-500 to-green-600"; // Future
    } else {
      return "from-orange-500 to-red-500"; // Overdue
    }
  };

  const getStatusIcon = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jadwalDate = new Date(jadwal.tanggal);
    jadwalDate.setHours(0, 0, 0, 0);
    
    if (jadwalDate.getTime() === today.getTime()) {
      return "📋"; // Today
    } else if (jadwalDate.getTime() > today.getTime()) {
      return "⏰"; // Future
    } else {
      return "⚠️"; // Overdue
    }
  };

  const getCareTypeIcon = (type) => {
    const icons = {
      'penyiraman': '💧',
      'pemupukan': '🌱',
      'pemangkasan': '✂️',
      'penyemprotan': '🚿',
      'pemindahan': '📦',
      'default': '🌿'
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor()} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-lg">
                  {getStatusIcon()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {getCareTypeIcon(jadwal.jenis_perawatan)}
                      {jadwal.nama_tanaman || jadwal.namaTanaman}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        {jadwal.jenis_perawatan || jadwal.kegiatan}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {formatDate ? formatDate(jadwal.tanggal) : jadwal.tanggal}
                      </span>
                    </div>
                    {jadwal.catatan && (
                      <p className="text-sm text-gray-500 mt-1 italic">{jadwal.catatan}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(jadwal)}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(jadwal.id)}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200 group relative overflow-hidden">
      {/* Status indicator */}
      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${getStatusColor()} rounded-bl-2xl flex items-center justify-center`}>
        <span className="text-white text-lg">
          {getStatusIcon()}
        </span>
      </div>

      <div className="mb-4 pr-12">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
          <span className="text-white text-2xl">
            {getCareTypeIcon(jadwal.jenis_perawatan || jadwal.kegiatan)}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {jadwal.nama_tanaman || jadwal.namaTanaman}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium">Perawatan:</span>
            <span className="text-sm">{jadwal.jenis_perawatan || jadwal.kegiatan}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm font-medium">Tanggal:</span>
            <span className="text-sm font-semibold">
              {formatDate ? formatDate(jadwal.tanggal) : jadwal.tanggal}
            </span>
          </div>
          
          {jadwal.catatan && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">
                💭 {jadwal.catatan}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(jadwal)}
          className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDelete(jadwal.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus
        </button>
      </div>
    </div>
  );
};

export default JadwalCard;
