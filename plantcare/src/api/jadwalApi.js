// src/api/jadwalApi.js
// Integrasi CRUD Jadwal ke backend Pyramid

const API_BASE = 'http://localhost:6543/jadwal';

// Pagination support: getJadwalList({ limit, offset })
export async function getJadwalList({ limit = 20, offset = 0 } = {}) {
  const url = `${API_BASE}?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal mengambil data jadwal');
  const data = await res.json();
  // Backend mengembalikan format: {"jadwal": [...], "pagination": {...}}
  return {
    jadwal: data.jadwal || [],
    pagination: data.pagination || { limit, offset, total: data.jadwal?.length || 0 }
  };
}

export async function getJadwalById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Jadwal tidak ditemukan');
  return res.json();
}

export async function createJadwal(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal menambah jadwal');
  return res.json();
}

export async function updateJadwal(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal mengupdate jadwal');
  return res.json();
}

export async function deleteJadwal(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Gagal menghapus jadwal');
  return res.json();
}
