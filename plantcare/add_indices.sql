-- Add indices to improve query performance

-- Indeks untuk tabel tanaman
CREATE INDEX IF NOT EXISTS idx_tanaman_nama ON tanaman(nama);
CREATE INDEX IF NOT EXISTS idx_tanaman_jenis ON tanaman(jenis);
CREATE INDEX IF NOT EXISTS idx_tanaman_lokasi ON tanaman(lokasi);
CREATE INDEX IF NOT EXISTS idx_tanaman_created_at ON tanaman(created_at);

-- Indeks untuk tabel jadwal
CREATE INDEX IF NOT EXISTS idx_jadwal_tanaman ON jadwal(nama_tanaman);
CREATE INDEX IF NOT EXISTS idx_jadwal_tanggal ON jadwal(tanggal);
CREATE INDEX IF NOT EXISTS idx_jadwal_kegiatan ON jadwal(kegiatan);
CREATE INDEX IF NOT EXISTS idx_jadwal_tanaman_tanggal ON jadwal(nama_tanaman, tanggal);

-- CRITICAL: Index untuk login performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Optimasi untuk pencarian umum
ANALYZE tanaman;
ANALYZE jadwal;
ANALYZE users;
