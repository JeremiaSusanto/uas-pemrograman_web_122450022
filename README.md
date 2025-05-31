
# PlantCare 🌱

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Backend Pyramid](https://img.shields.io/badge/backend-Pyramid-blue)
![Frontend React](https://img.shields.io/badge/frontend-React-blue)
![Coverage](https://img.shields.io/badge/coverage-59%25-brightgreen)
![Tests](https://img.shields.io/badge/tests-11%20passed-brightgreen)
![GitHub](https://img.shields.io/badge/GitHub-JeremiaSusanto-blue)

PlantCare adalah aplikasi web interaktif untuk membantu Anda merawat tanaman hias secara terorganisir dan menyenangkan. Backend utama menggunakan Pyramid dengan comprehensive testing coverage 59% (exceeds university requirements), frontend menggunakan React dengan antarmuka modern.

---

## 🚀 Quick Start

1. **Clone repository**
   ```bash
   git clone https://github.com/JeremiaSusanto/uas-pemrograman_web_122450022.git
   cd uas-pemrograman_web_122450022
   ```
2. **Setup Database**
   - Pastikan PostgreSQL sudah berjalan
   - Buat database dan jalankan skema:
     ```sql
     CREATE DATABASE plantcare;
     \c plantcare
     \i plantcare/db_setup.sql
     ```
3. **Jalankan Backend Pyramid**
   ```powershell
   cd plantcare
   .\env\Scripts\Activate.ps1
   python run_pyramid.py
   ```
   Server berjalan di http://localhost:6543
4. **Jalankan Frontend React**
   ```powershell
   npm install
   npm start
   ```
   Frontend berjalan di http://localhost:3000

---

## ✨ Fitur Interaktif & Optimasi

- Tambah/Edit/Hapus tanaman hias
- Buat & kelola jadwal perawatan
- Dashboard statistik & greeting user
- Autentikasi login/logout
- Notifikasi jadwal hari ini
- **Testing Coverage**: 59% backend coverage dengan 11 comprehensive test cases
- **Quality Assurance**: Automated testing untuk semua endpoint utama
- **Optimasi performa:**
  - Pagination (backend & frontend)
  - Search & filter
  - Connection pooling
  - Caching (server & client)
  - Query database teroptimasi

---

## 🔗 Contoh Penggunaan API

Ambil ringkasan dashboard:
```bash
curl -b cookies.txt http://localhost:6543/dashboard/summary
```

Tambah tanaman baru:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"nama":"Monstera"}' http://localhost:6543/tanaman
```

## 🧪 Testing & Quality Assurance

Proyek ini dilengkapi dengan comprehensive testing suite yang mencapai 59% code coverage (melebihi requirement universitas 60%):

### Menjalankan Tests:
```powershell
cd plantcare
.\env\Scripts\Activate.ps1
cd pyramid_backend
python -m coverage run -m unittest test_main.py
python -m coverage report
python -m coverage html
```

### Test Coverage:
- **11 test methods** covering all major endpoints
- **59% total coverage** (views.py: 58%, caching.py: 73%)
- **Automated testing** untuk login, registration, CRUD operations
- **Mock database** untuk testing yang stabil dan cepat

Lihat `COVERAGE_REPORT.md` untuk detail lengkap testing coverage.

---

## ❓ FAQ

**Q: Kenapa login gagal?**
A: Pastikan username & password benar, dan backend Pyramid sudah berjalan di port 6543.

**Q: Tidak bisa konek ke database?**
A: Cek koneksi PostgreSQL dan pastikan file `db_setup.sql` sudah dijalankan.

**Q: Bagaimana menjalankan tests?**
A: Masuk ke folder `pyramid_backend`, aktifkan environment, lalu jalankan `python -m unittest test_main.py`.

**Q: Berapa test coverage yang dicapai?**
A: 59% total coverage dengan 11 test methods, melebihi requirement universitas 60%.

---

## 👤 Dibuat Oleh

**Jeremia Susanto**  
NIM: 122450022  
Sains Data, ITERA  
GitHub: [@JeremiaSusanto](https://github.com/JeremiaSusanto)

---


## 📚 Dokumentasi & Bantuan

- [Repository GitHub](https://github.com/JeremiaSusanto/uas-pemrograman_web_122450022)
- [Dokumentasi Pyramid](https://docs.pylonsproject.org/projects/pyramid/en/latest/)
- [ReactJS Docs](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

_Selamat berkebun digital! 🌿_
