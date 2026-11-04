# Dokumentasi CMS: Fitur Batch Upload, Export & Tabel Editor Menu (`gaspol-cms`)

Dokumen ini menjelaskan alur penggunaan dan arsitektur komponen frontend untuk fitur **Export Excel, Download Template, Import Excel, dan GUI Tabel Editor Menu Massal** pada `gaspol-cms`.

---

## 1. File Terkait
- **Halaman Utama Menu**: [`src/components/Menu.js`](../src/components/Menu.js)
- **Modal Batch Menu Studio**: [`src/components/MenuBatchModal.js`](../src/components/MenuBatchModal.js)
- **Stylesheet**: [`src/styles/menu-module.css`](../src/styles/menu-module.css)

---

## 2. Fitur Utama pada Halaman `Management Menu`

Pada bagian header halaman **Management Menu**, kini tersedia 3 tombol aksi:
1. **`Export Excel`**:
   - Mengunduh seluruh daftar menu, varian, dan harga per *Serving Type* milik outlet aktif menjadi file `.xlsx`.
   - File hasil export memiliki format kolom yang sama persis dengan template import, sehingga user dapat mengedit harga 50–100+ menu di Excel lalu langsung meng-uploadnya kembali.
2. **`Batch Upload / Import`**:
   - Membuka modal **Batch Menu Studio** (`MenuBatchModal.js`).
3. **`Tambah Data`**:
   - Membuka modal input menu satuan (`MenuModal.js`) beserta fitur upload gambar produk.

---

## 3. Alur Kerja di Dalam Modal `MenuBatchModal`

### Langkah 1: Template & Export
- User dapat menekan **`Download Template .xlsx`** untuk mendapatkan template Excel dengan kolom *Serving Type* dinamis sesuai outlet yang sedang login, lengkap dengan dropdown validasi `Tipe Menu` (`Makanan`, `Minuman`, `Additional Makanan`, `Additional Minuman`).

### Langkah 2: Import File Excel atau Input Langsung di GUI Tabel Web
- Saat user memilih file `.xlsx` / `.xls` / `.csv`, file dibaca langsung di sisi browser menggunakan library `xlsx` (`SheetJS`) dan dimuat ke dalam **Tabel Preview Interaktif**.
- User juga dapat menambahkan baris langsung di web tanpa Excel menggunakan tombol **`+5 Baris Manual`** atau **`+ Tambah 1 Baris`**.
- Tersedia tombol **`Samakan Harga Kosong`** untuk menyalin `Harga Dasar` ke seluruh kolom `Harga: <Serving Type>` yang belum diisi dengan 1 klik.

### Langkah 3: Validasi Real-Time & Pilihan Mode Duplikat
Setiap baris pada tabel dievaluasi secara otomatis terhadap data menu yang sudah ada di outlet:
- **`MENU BARU` (Hijau)**: Nama menu belum pernah terdaftar di outlet.
- **`VARIAN BARU` (Hijau)**: Baris memiliki isi pada kolom `Nama Varian`.
- **`UPDATE MENU` / `UPDATE VARIAN` (Biru)**: Nama menu sudah terdaftar di outlet dan akan diperbarui harganya (ketika memilih **Mode Upsert**).
- **`DILEWATI (SKIP)` (Abu-abu)**: Nama menu sudah terdaftar dan akan dilewati (ketika memilih **Mode Skip**).
- **`PERLU PERBAIKAN` (Merah)**: Kolom wajib (`Nama Menu *`, `Tipe Menu *`, atau `Harga Dasar *`) kosong atau tidak valid. User dapat langsung mengetik perbaikan di sel tabel tanpa harus mengulang upload file Excel.

### Langkah 4: Penyimpanan Atomic & Safe Auto-Retry
- Saat user menekan **`Simpan Massal`**, frontend menghitung *deterministic fingerprint* (`idempotency_key`) dari isi batch dan mengirimkannya ke endpoint `POST /v2/menu/batch/import`.
- Jika terjadi gangguan jaringan sementara (*network timeout* / `502` / `503` / `504`), frontend otomatis melakukan *safe retry* hingga 3 kali menggunakan `idempotency_key` yang sama sehingga dijamin bebas duplikasi data.
