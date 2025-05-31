-- PlantCare Database Setup Script

-- Create tables if they don't exist

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tanaman (Plants) table
CREATE TABLE IF NOT EXISTS tanaman (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    jenis VARCHAR(100),
    lokasi VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jadwal (Schedule) table
CREATE TABLE IF NOT EXISTS jadwal (
    id SERIAL PRIMARY KEY,
    nama_tanaman VARCHAR(100) NOT NULL,
    kegiatan VARCHAR(200) NOT NULL,
    tanggal DATE
);

-- Insert sample data if the tables are empty
INSERT INTO tanaman (nama, jenis, lokasi)
SELECT 'Lidah Buaya', 'Sukulen', 'Halaman Depan'
WHERE NOT EXISTS (SELECT 1 FROM tanaman WHERE nama = 'Lidah Buaya');

INSERT INTO tanaman (nama, jenis, lokasi)
SELECT 'Monstera', 'Hias', 'Ruang Tamu'
WHERE NOT EXISTS (SELECT 1 FROM tanaman WHERE nama = 'Monstera');

INSERT INTO jadwal (nama_tanaman, kegiatan, tanggal)
SELECT 'Lidah Buaya', 'Penyiraman', CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM jadwal WHERE nama_tanaman = 'Lidah Buaya' AND kegiatan = 'Penyiraman');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash)
SELECT 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewnXCKIZhxf.zl8G'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Show table contents
SELECT 'Current plants in database:' AS message;
SELECT * FROM tanaman;

SELECT 'Current schedules in database:' AS message;
SELECT * FROM jadwal;
