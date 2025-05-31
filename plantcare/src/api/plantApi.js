// src/api/plantApi.js
// Integrasi CRUD Tanaman ke backend Pyramid

const API_BASE = 'http://localhost:6543/tanaman';

// Pagination support: getTanamanList({ limit, offset })
export async function getTanamanList({ limit = 20, offset = 0 } = {}) {
  const url = `${API_BASE}?limit=${limit}&offset=${offset}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Gagal mengambil data tanaman');
  const data = await res.json();
  // Backend mengembalikan format: {"tanaman": [...], "pagination": {...}}
  return {
    tanaman: data.tanaman || [],
    pagination: data.pagination || { limit, offset, total: data.tanaman?.length || 0 }
  };
}

export async function getTanamanById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Tanaman tidak ditemukan');
  return res.json();
}

export async function createTanaman(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal menambah tanaman');
  return res.json();
}

export async function updateTanaman(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal mengupdate tanaman');
  return res.json();
}

export async function deleteTanaman(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Gagal menghapus tanaman');
  return res.json();
}
