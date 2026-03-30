# 📚 Dokumentasi Fitur Revenue Generator

## Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Perubahan Database](#perubahan-database)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Cara Penggunaan](#cara-penggunaan)
7. [Troubleshooting](#troubleshooting)

---

## Pendahuluan

### Deskripsi Fitur
Revenue Generator adalah fitur untuk men-generate transaksi secara otomatis guna mencapai target pendapatan bulanan tertentu. Fitur ini berguna untuk keperluan testing, demo, atau kebutuhan khusus lainnya.

### Akses Fitur
- **Hanya dapat diakses oleh**: Outlet ID 0 dan Outlet ID 4
- **Outlet yang bisa dipilih untuk generate**: Outlet ID 4 dan Outlet ID > 11
- **Outlet yang TIDAK bisa dipilih**: ID 0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11

### Fitur Utama
- ✅ Generate transaksi otomatis berdasarkan target bulanan
- ✅ Distribusi transaksi berdasarkan hari (weekday/weekend)
- ✅ Opsi PPN (tidak berlaku untuk online delivery)
- ✅ Template menu dari Outlet ID 3
- ✅ Rollback/undo per batch
- ✅ Riwayat generate dengan detail
- ✅ **Lihat detail item per transaksi**
- ✅ Print report
- ✅ **Format receipt/invoice sesuai pattern existing**
- ✅ **Generate fake refunds (1-3 per hari)**
- ✅ **Generate fake expenditures (2-5 per hari)**
- ✅ **Print Laporan Kasir dengan input nama kasir (multiple)**
+ ✅ **Download report dalam format PDF, Excel, dan Word** (tabel sesuai tampilan print, mapping qty/nominal sudah benar)
+ ✅ **Checklist section**: Pilih bagian laporan yang ingin di-download (Rincian Shift, Rincian Laporan, Expenditure, Transaksi, dll)
+ ✅ **Validasi kasir**: Minimal 1 nama kasir wajib diisi untuk print/download laporan kasir
+ ✅ **Penghapusan random expenditure tertentu**: Service AC dan Parkir tidak lagi muncul di randomisasi pengeluaran
+ ✅ **Loading spinner pada Preview Kalkulasi**: Terdapat spinner saat proses kalkulasi preview
+ ✅ **UI/UX batch detail lebih modern**: Tampilan detail batch lebih rapi, informatif, dan responsif

### Opsi Generate

| Opsi | Deskripsi |
|------|-----------|
| **Gunakan PPN (11%)** | Menambahkan pajak 11% ke setiap transaksi. **TIDAK berlaku** untuk pembayaran online delivery (GoFood, GrabFood, ShopeeFood) karena sudah include. |
| **Weekend Lebih Ramai** | Distribusi transaksi di hari Sabtu & Minggu akan 1.5x - 2.5x lebih banyak dari hari biasa, menyesuaikan pola bisnis real. |
| **Mode Booking** | Menambahkan beberapa transaksi besar (booking/reservasi) dengan jumlah item lebih banyak per transaksi, biasanya untuk acara atau group dining. |
| **Generate Refund** | Membuat data refund palsu (1-3 refund per hari) dari transaksi yang sudah di-generate, dengan alasan refund acak. |
| **Generate Pengeluaran** | Membuat data pengeluaran palsu (2-5 pengeluaran per hari) dengan nominal Rp 5.000 - Rp 200.000 dan deskripsi acak. |
| **Checklist Section Download** | Pilih bagian laporan yang ingin di-download (Rincian Shift, Rincian Laporan, Expenditure, Transaksi, dll) |
| **Validasi Nama Kasir** | Minimal 1 nama kasir wajib diisi untuk print/download laporan kasir |
| **Loading Spinner Preview** | Terdapat spinner saat proses kalkulasi preview |
| **Penghapusan Expenditure Tertentu** | Service AC dan Parkir tidak lagi muncul di randomisasi pengeluaran |
| **UI/UX Batch Detail Modern** | Tampilan detail batch lebih rapi, informatif, dan responsif |

---

## Perubahan Database

### Script SQL yang Perlu Dijalankan

Jalankan script berikut di database MySQL Anda:

```sql
-- =============================================
-- MIGRATION: Revenue Generator Feature
-- Tanggal: 2026-03-31
-- =============================================

-- 1. Tambah kolom di tabel transactions
ALTER TABLE transactions 
ADD COLUMN is_generated TINYINT(1) DEFAULT 0 COMMENT 'Flag untuk transaksi yang di-generate otomatis',
ADD COLUMN generated_batch_id INT DEFAULT NULL COMMENT 'ID batch untuk tracking rollback';

-- 2. Tambah kolom di tabel carts
ALTER TABLE carts 
ADD COLUMN is_generated TINYINT(1) DEFAULT 0,
ADD COLUMN generated_batch_id INT DEFAULT NULL;

-- 3. Buat tabel generated_revenue_logs
CREATE TABLE IF NOT EXISTS generated_revenue_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    outlet_id INT NOT NULL,
    target_month INT NOT NULL COMMENT '1-12',
    target_year INT NOT NULL COMMENT 'e.g. 2026',
    target_revenue DECIMAL(15,2) NOT NULL COMMENT 'Target pendapatan dalam Rupiah',
    existing_revenue DECIMAL(15,2) DEFAULT 0 COMMENT 'Revenue existing sebelum generate',
    generated_revenue DECIMAL(15,2) DEFAULT 0 COMMENT 'Revenue yang di-generate batch ini',
    actual_total_revenue DECIMAL(15,2) DEFAULT 0 COMMENT 'Total revenue setelah generate',
    
    total_transactions_created INT DEFAULT 0,
    total_carts_created INT DEFAULT 0,
    total_cart_details_created INT DEFAULT 0,
    total_refunds_created INT DEFAULT 0,
    total_refund_details_created INT DEFAULT 0,
    total_refund_amount DECIMAL(15,2) DEFAULT 0,
    total_expenditures_created INT DEFAULT 0,
    total_expenditure_amount DECIMAL(15,2) DEFAULT 0,
    
    use_ppn TINYINT(1) DEFAULT 0 COMMENT 'Apakah pakai PPN',
    weekend_boost TINYINT(1) DEFAULT 0 COMMENT 'Weekend lebih ramai',
    booking_mode TINYINT(1) DEFAULT 0 COMMENT 'Ada transaksi booking besar',
    generate_refunds TINYINT(1) DEFAULT 0 COMMENT 'Generate fake refunds',
    generate_expenditures TINYINT(1) DEFAULT 0 COMMENT 'Generate fake expenditures',
    price_adjustment_percent DECIMAL(5,2) DEFAULT 0 COMMENT 'Persentase adjustment harga dari outlet 3',
    
    generated_by_user_id INT,
    generated_by_username VARCHAR(100),
    status ENUM('active', 'rolled_back') DEFAULT 'active',
    
    rolled_back_at DATETIME NULL,
    rolled_back_by_user_id INT NULL,
    rolled_back_by_username VARCHAR(100) NULL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_outlet_month_year (outlet_id, target_year, target_month),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tambah kolom di tabel refunds (untuk tracking generated refunds)
ALTER TABLE refunds 
ADD COLUMN is_generated TINYINT(1) DEFAULT 0,
ADD COLUMN generated_batch_id INT DEFAULT NULL;

-- 5. Tambah kolom di tabel refund_details (untuk tracking generated refund details)
ALTER TABLE refund_details 
ADD COLUMN is_generated TINYINT(1) DEFAULT 0,
ADD COLUMN generated_batch_id INT DEFAULT NULL;

-- 6. Tambah kolom di tabel expenditures (untuk tracking generated expenditures)
ALTER TABLE expenditures 
ADD COLUMN is_generated TINYINT(1) DEFAULT 0,
ADD COLUMN generated_batch_id INT DEFAULT NULL;

-- =============================================
-- END MIGRATION
-- =============================================
```

### Struktur Tabel Baru: `generated_revenue_logs`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | INT | Primary key, auto increment |
| outlet_id | INT | ID outlet tujuan generate |
| target_month | INT | Bulan target (1-12) |
| target_year | INT | Tahun target |
| target_revenue | DECIMAL(15,2) | Target pendapatan |
| existing_revenue | DECIMAL(15,2) | Revenue existing sebelum generate |
| generated_revenue | DECIMAL(15,2) | Revenue yang di-generate |
| actual_total_revenue | DECIMAL(15,2) | Total revenue setelah generate |
| total_transactions_created | INT | Jumlah transaksi dibuat |
| total_carts_created | INT | Jumlah cart dibuat |
| total_cart_details_created | INT | Jumlah cart detail dibuat |
| total_refunds_created | INT | Jumlah refund dibuat |
| total_refund_details_created | INT | Jumlah refund detail dibuat |
| total_refund_amount | DECIMAL(15,2) | Total nominal refund |
| total_expenditures_created | INT | Jumlah pengeluaran dibuat |
| total_expenditure_amount | DECIMAL(15,2) | Total nominal pengeluaran |
| use_ppn | TINYINT(1) | Flag penggunaan PPN |
| weekend_boost | TINYINT(1) | Flag weekend lebih ramai |
| booking_mode | TINYINT(1) | Flag mode booking |
| generate_refunds | TINYINT(1) | Flag generate refund |
| generate_expenditures | TINYINT(1) | Flag generate pengeluaran |
| price_adjustment_percent | DECIMAL(5,2) | Persentase adjustment harga |
| generated_by_user_id | INT | User ID yang generate |
| generated_by_username | VARCHAR(100) | Username yang generate |
| status | ENUM | 'active' atau 'rolled_back' |
| rolled_back_at | DATETIME | Waktu rollback |
| rolled_back_by_user_id | INT | User ID yang rollback |
| rolled_back_by_username | VARCHAR(100) | Username yang rollback |
| created_at | DATETIME | Waktu dibuat |
| updated_at | DATETIME | Waktu update |

### Kolom Baru di Tabel Existing

#### Tabel `transactions`:
| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| is_generated | TINYINT(1) | 0 | Flag transaksi generated |
| generated_batch_id | INT | NULL | ID batch untuk rollback |

#### Tabel `carts`:
| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| is_generated | TINYINT(1) | 0 | Flag cart generated |
| generated_batch_id | INT | NULL | ID batch untuk rollback |

#### Tabel `refunds`:
| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| is_generated | TINYINT(1) | 0 | Flag refund generated |
| generated_batch_id | INT | NULL | ID batch untuk rollback |

#### Tabel `refund_details`:
| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| is_generated | TINYINT(1) | 0 | Flag refund detail generated |
| generated_batch_id | INT | NULL | ID batch untuk rollback |

#### Tabel `expenditures`:
| Kolom | Tipe | Default | Deskripsi |
|-------|------|---------|-----------|
| is_generated | TINYINT(1) | 0 | Flag expenditure generated |
| generated_batch_id | INT | NULL | ID batch untuk rollback |

### Format Data Generated

Transaksi yang di-generate mengikuti pattern yang sama dengan transaksi real:

| Field | Pattern | Contoh |
|-------|---------|--------|
| `transaction_ref` | `{outlet_id}-{YYYYMMDD}-{HHmmss}-{CustomerName}` | `4-20260125-121115-Pixuco` |
| `receipt_number` | `DT-{CustomerName}DT-{seat}-{YYYYMMDD}-{HHmmss}` | `DT-PixucoDT-33-20260125-121200` |
| `customer_name` | `{RandomName}DT` | `PixucoDT`, `LodaDT`, `PuwiwuboDT` |
| `invoice_number` | `INV-{YYYYMMDD}-{HHmmss}{payment_type_id}` | `INV-20260125-12120010` |

**Catatan:** Customer name di-generate random dengan pola syllable (konsonan+vokal) seperti nama existing: Pixuco, Loda, Biwedil, Jokog, dll.

---

## Backend Implementation

### File yang Dibuat/Diubah

#### 1. Model: `src/models/generated_revenue.js` (BARU)

Lokasi: `gaspol-api/src/models/generated_revenue.js`

Fungsi-fungsi utama:
- `getAllLogs()` - Ambil semua log generate
- `getLogById(id)` - Ambil detail log
- `getExistingRevenue()` - Hitung revenue existing
- `createLog()` - Buat log baru
- `updateLog()` - Update log
- `getTemplateMenus()` - Ambil menu dari outlet 3
- `getPaymentTypes()` - Ambil payment types
- `getServingTypes()` - Ambil serving types
- `bulkCreateCarts()` - Bulk insert carts
- `bulkCreateCartDetails()` - Bulk insert cart details
- `bulkCreateTransactions()` - Bulk insert transactions
- `bulkCreateRefunds()` - Bulk insert refunds
- `bulkCreateRefundDetails()` - Bulk insert refund details
- `bulkCreateExpenditures()` - Bulk insert expenditures
- `getTransactionsByBatchId()` - Ambil transaksi per batch
- `getRefundsByBatchId()` - Ambil refund per batch
- `getExpendituresByBatchId()` - Ambil pengeluaran per batch
- `rollbackBatchWithAll()` - Rollback batch (soft delete semua: transactions, carts, refunds, refund_details, expenditures)
- `getAllOutlets()` - Ambil semua outlet
- `getSummaryByMonth()` - Summary per bulan
- `getDailyBreakdown()` - Breakdown harian
- `getTransactionsForRefund()` - Ambil transaksi untuk di-refund
- `getCartDetailsForTransaction()` - Ambil cart details per transaksi

#### 2. Controller: `src/controllers/revenueGeneratorController.js` (BARU)

Lokasi: `gaspol-api/src/controllers/revenueGeneratorController.js`

Endpoints:
- `getLogs` - GET semua log
- `getLogById` - GET detail log
- `getOutlets` - GET outlets untuk dropdown
- `previewGeneration` - Preview kalkulasi
- `generateRevenue` - Generate transaksi (+ refunds + expenditures jika enabled)
- `rollbackBatch` - Rollback batch
- `getRefundsByBatch` - GET refunds per batch
- `getExpendituresByBatch` - GET expenditures per batch
- `getTransactionsByBatch` - GET transaksi per batch
- `getDailyBreakdown` - GET breakdown harian
- `getSummaryByMonth` - GET summary bulanan

#### 3. Routes: `src/routes.js` (DIUBAH)

Ditambahkan di akhir file sebelum `module.exports`:

```javascript
const revenueGenerator = require("./controllers/revenueGeneratorController");

// Revenue Generator (Fake Transaction Generator)
route.get("/revenue-generator/logs", revenueGenerator.getLogs);
route.get("/revenue-generator/logs/:id", revenueGenerator.getLogById);
route.get("/revenue-generator/outlets", revenueGenerator.getOutlets);
route.get("/revenue-generator/preview", revenueGenerator.previewGeneration);
route.get("/revenue-generator/summary", revenueGenerator.getSummaryByMonth);
route.get("/revenue-generator/transactions/:id", revenueGenerator.getTransactionsByBatch);
route.get("/revenue-generator/transaction-detail/:id", revenueGenerator.getTransactionDetail);
route.get("/revenue-generator/daily-breakdown/:id", revenueGenerator.getDailyBreakdown);
route.get("/revenue-generator/refunds/:id", revenueGenerator.getRefundsByBatch);
route.get("/revenue-generator/expenditures/:id", revenueGenerator.getExpendituresByBatch);
route.post("/revenue-generator/generate", revenueGenerator.generateRevenue);
route.post("/revenue-generator/rollback/:id", revenueGenerator.rollbackBatch);
```

---

## Frontend Implementation

### File yang Dibuat/Diubah

#### 1. Komponen: `src/components/RevenueGenerator.js` (BARU)

Lokasi: `gaspol-cms/src/components/RevenueGenerator.js`

Fitur:
- Form input (outlet, bulan, tahun, target revenue)
- Opsi toggle (PPN, weekend boost, booking mode, generate refunds, generate expenditures)
- Preview kalkulasi sebelum generate
- Tabel riwayat generate (dengan info refund & expenditure)
- Tombol detail dan rollback

#### 2. Modal: `src/components/RevenueGeneratorDetailModal.js` (BARU)

Lokasi: `gaspol-cms/src/components/RevenueGeneratorDetailModal.js`

Fitur:
- Summary cards (outlet, periode, target, status)
- Revenue breakdown (existing, generated, total)
- Stats (transaksi, carts, items, refunds, expenditures)
- Opsi yang digunakan
- Tab daily summary, transactions, refunds, dan expenditures
- **Print Laporan Kasir** dengan input nama kasir (multiple)
- Print detail functionality

#### 3. Sidebar: `src/components/common/Sidebar.js` (DIUBAH)

Ditambahkan menu "Developer Tools" untuk outlet 0 dan 4:

```javascript
// Revenue Generator - Only for outlet 0 and 4
...(userTokenData?.outlet_id === 0 || userTokenData?.outlet_id === 4 ? [{
  title: "Developer Tools",
  items: [
    { accessCode: 99, icon: "bi-gear-wide-connected", label: "Revenue Generator", path: "/revenue-generator" }
  ]
}] : [])
```

#### 4. App.js: `src/App.js` (DIUBAH)

Ditambahkan import dan route:

```javascript
import RevenueGenerator from "./components/RevenueGenerator";

// Di dalam Routes:
{(userTokenData.outlet_id === 0 || userTokenData.outlet_id === 4) && (
  <Route path="/revenue-generator" element={<RevenueGenerator userTokenData={userTokenData} />} />
)}
```

---

## API Endpoints

### 13. Download Report (PDF, Excel, Word)
Download laporan kasir dalam format PDF, Excel, atau Word. Tersedia checklist section untuk memilih bagian laporan yang ingin di-include.

**Endpoint:**
- GET `/revenue-generator/download/pdf/:batch_id`
- GET `/revenue-generator/download/excel/:batch_id`
- GET `/revenue-generator/download/word/:batch_id`

**Query Params:**
- `sections` (array, optional): Daftar section yang ingin di-include, contoh: `sections=shift,summary,expenditure,transactions`
- `cashiers` (array, required): Daftar nama kasir yang akan dicetak di laporan

**Response:**
- File PDF/Excel/Word yang sudah ter-mapping dengan benar (qty, nominal, dsb sesuai tampilan print HTML)

**Catatan Mapping Data:**
- Kolom qty, nominal, dan total pada setiap section sudah sesuai dengan data real dan tampilan print HTML
- Section yang tidak dicentang tidak akan muncul di file download
- Nama kasir akan muncul di bagian bawah laporan

**Contoh Request:**
```
GET /revenue-generator/download/pdf/1?sections=shift,summary,expenditure,transactions&cashiers=Andi,Budi
```

**Contoh Response:**
- File PDF siap print/download

### 1. GET `/revenue-generator/logs`
Ambil semua log generate.

**Query Params:**
- `outlet_id` (optional): Filter by outlet

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "outlet_id": 4,
      "outlet_name": "Outlet Name",
      "target_month": 2,
      "target_year": 2026,
      "target_revenue": 100000000,
      "generated_revenue": 20000000,
      "status": "active",
      ...
    }
  ]
}
```

### 2. GET `/revenue-generator/logs/:id`
Ambil detail log termasuk transaksi dan daily breakdown.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "outlet_name": "...",
    "transactions": [...],
    "dailyBreakdown": [...]
  }
}
```

### 3. GET `/revenue-generator/outlets`
Ambil daftar outlet untuk dropdown.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Outlet 1", "is_selectable": false },
    { "id": 4, "name": "Outlet 4", "is_selectable": true },
    { "id": 11, "name": "Outlet 11", "is_selectable": false },
    { "id": 12, "name": "Outlet 12", "is_selectable": true }
  ]
}
```

**Catatan:** Hanya outlet ID 4 dan ID > 11 yang `is_selectable: true`

### 4. GET `/revenue-generator/preview`
Preview kalkulasi sebelum generate.

**Query Params:**
- `outlet_id` (required)
- `month` (required)
- `year` (required)
- `target_revenue` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "existing_revenue": 80000000,
    "target_revenue": 100000000,
    "revenue_to_generate": 20000000,
    "is_target_exceeded": false
  }
}
```

### 5. POST `/revenue-generator/generate`
Generate transaksi.

**Body:**
```json
{
  "outlet_id": 4,
  "month": 2,
  "year": 2026,
  "target_revenue": 100000000,
  "use_ppn": false,
  "weekend_boost": true,
  "booking_mode": false,
  "generate_refunds": true,
  "generate_expenditures": true,
  "user_id": 1,
  "username": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Revenue berhasil di-generate!",
  "data": {
    "batch_id": 1,
    "transactions_created": 3500,
    "generated_revenue": 20000000,
    "actual_total_revenue": 100000000,
    "refunds_created": 60,
    "total_refund_amount": 500000,
    "expenditures_created": 90,
    "total_expenditure_amount": 3000000
  }
}
```

### 6. POST `/revenue-generator/rollback/:id`
Rollback batch (soft delete).

**Body:**
```json
{
  "user_id": 1,
  "username": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rollback berhasil!"
}
```

### 7. GET `/revenue-generator/transactions/:id`
Ambil daftar transaksi per batch.

### 8. GET `/revenue-generator/transaction-detail/:id`
Ambil detail transaksi lengkap dengan items.

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": 123,
    "transaction_ref": "4-20260125-121115-Pixuco",
    "receipt_number": "DT-PixucoDT-33-20260125-121200",
    "customer_name": "PixucoDT",
    "customer_seat": 33,
    "payment_type": "Cash",
    "total": 37000,
    "subtotal": 33333,
    "items": [
      {
        "menu_name": "Ayam Goreng",
        "varian": "Pedas",
        "qty": 2,
        "price": 15000,
        "total_price": 30000
      }
    ]
  }
}
```

### 9. GET `/revenue-generator/daily-breakdown/:id`
Ambil breakdown harian per batch.

### 10. GET `/revenue-generator/summary`
Ambil summary per bulan.

**Query Params:**
- `outlet_id` (required)
- `month` (required)
- `year` (required)

### 11. GET `/revenue-generator/refunds/:id`
Ambil daftar refund per batch.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "refund_id": 1,
      "transaction_id": 123,
      "receipt_number": "DT-PixucoDT-33-20260125-121200",
      "customer_name": "PixucoDT",
      "refund_reason": "Pesanan salah",
      "total_refund": 15000,
      "payment_type": "Cash",
      "created_at": "2026-01-25 14:30:00"
    }
  ]
}
```

### 12. GET `/revenue-generator/expenditures/:id`
Ambil daftar pengeluaran per batch.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "expenditure_id": 1,
      "outlet_id": 4,
      "description": "Beli gas LPG",
      "nominal": 25000,
      "created_at": "2026-01-25 10:15:00"
    }
  ]
}
```

---

## Cara Penggunaan

### Langkah 1: Jalankan Migration SQL

1. Buka database MySQL Anda
2. Copy dan jalankan script SQL dari bagian [Perubahan Database](#perubahan-database)
3. Pastikan tidak ada error

### Langkah 2: Restart Backend

```bash
cd gaspol-api
npm run start
```

### Langkah 3: Restart Frontend

```bash
cd gaspol-cms
npm run start
```

### Langkah 4: Akses Fitur

1. Login dengan akun yang memiliki outlet_id 0 atau 4
2. Di sidebar, cari menu "Developer Tools" > "Revenue Generator"

3. Isi form:
  - Pilih outlet tujuan
  - Pilih bulan dan tahun
  - Masukkan target pendapatan
  - Pilih opsi (PPN, weekend boost, booking mode, generate refund, generate expenditure)
  - Centang **Checklist Section Download** untuk memilih bagian laporan yang ingin di-download (Rincian Shift, Rincian Laporan, Expenditure, Transaksi, dll)
  - **Validasi Nama Kasir:** Minimal 1 nama kasir wajib diisi untuk print/download laporan kasir
  - **Penghapusan Expenditure Tertentu:** Service AC dan Parkir tidak akan muncul di randomisasi pengeluaran
4. Klik "Preview Kalkulasi" untuk melihat estimasi. Akan muncul **loading spinner** selama proses kalkulasi.
5. Klik "Generate Revenue" untuk mulai generate data.
6. Setelah generate selesai, pada tabel riwayat batch, klik tombol download (ikon PDF, Excel, Word) untuk mengunduh laporan sesuai format yang diinginkan.
  - Pilih section yang ingin di-include pada dialog download.
  - Data pada file PDF/Excel/Word sudah ter-mapping dengan benar (qty, nominal, dsb sesuai tampilan print HTML).

### Langkah 5: Print Laporan Kasir

1. Buka detail batch dengan klik tombol biru (ikon mata)
2. Klik tombol hijau "Print Laporan Kasir" atau tombol download (PDF/Excel/Word) di bagian atas detail batch.
3. **Isi nama kasir** (bisa lebih dari satu):
  - Klik "Tambah Kasir" untuk menambah field
  - Klik tombol merah untuk menghapus field
  - **Minimal 1 nama kasir wajib diisi** untuk dapat print/download.
4. Pilih section yang ingin di-include pada laporan kasir (Rincian Shift, Rincian Laporan, Expenditure, Transaksi, dll).
5. Lihat preview laporan di bawah (untuk print) atau klik tombol download untuk mengunduh file sesuai format.
6. Data pada file PDF/Excel/Word sudah ter-mapping dengan benar (qty, nominal, dsb sesuai tampilan print HTML).
7. Klik "Print" untuk mencetak atau download untuk mengunduh file.

### Langkah 6: Rollback (Jika Diperlukan)

1. Di tabel "Riwayat Generate", cari batch yang ingin di-rollback
2. Klik tombol merah (ikon rollback)
3. Konfirmasi rollback
4. Semua data dalam batch tersebut akan di-soft delete:
   - Transactions
   - Carts
   - Cart details
   - **Refunds** (jika ada)
   - **Refund details** (jika ada)
   - **Expenditures** (jika ada)

---

## Troubleshooting
### Error: "Gagal download report (PDF/Excel/Word)"
**Solusi:**
- Pastikan sudah memilih minimal 1 section pada checklist download
- Pastikan sudah mengisi minimal 1 nama kasir
- Cek koneksi backend dan izin akses file

### Error: "Validasi kasir tidak terpenuhi"
**Solusi:**
- Minimal 1 nama kasir wajib diisi untuk print/download laporan kasir


### Error: "Tidak ada menu template dari outlet 3"
**Solusi:** Pastikan outlet ID 3 memiliki menu yang aktif (`is_active = 1`)

### Error: "Target sudah tercapai"
**Solusi:** Revenue existing sudah melebihi target. Pilih target yang lebih tinggi atau rollback batch sebelumnya.

### Error: "Outlet tidak diizinkan"
**Solusi:** Hanya outlet ID 4 dan ID > 10 yang bisa menjadi tujuan generate.

### Transaksi tidak muncul di Report
**Solusi:** Pastikan `invoice_due_date` tidak NULL dan `deleted_at` IS NULL.

### Generate sangat lambat
**Solusi:** 
- Kurangi jumlah transaksi per hari (edit di controller)
- Pastikan database memiliki index yang proper
- Pertimbangkan untuk generate dalam batch yang lebih kecil

---

## Catatan Penting

1. **Transaksi Generated** ditandai dengan `is_generated = 1` dan `generated_batch_id` yang mereferensikan ke tabel `generated_revenue_logs`

2. **Rollback** bersifat soft delete - data tidak benar-benar dihapus, hanya di-set `deleted_at`. Rollback mencakup: transactions, carts, refunds, refund_details, dan expenditures.

3. **PPN** (11%) tidak diterapkan untuk payment type yang mengandung kata: gofood, grabfood, shopeefood, grab, gojek, shopee

4. **Menu Template** diambil dari outlet ID 3. Pastikan outlet ini memiliki menu yang lengkap.

5. **Weekend Boost** membuat transaksi di hari Sabtu dan Minggu 1.5x - 2.5x lebih banyak dari hari biasa.

6. **Generate Refund** membuat 1-3 refund per hari dengan alasan acak seperti "Pesanan salah", "Customer cancel", dll.

7. **Generate Pengeluaran** membuat 2-5 pengeluaran per hari dengan nominal Rp 5.000 - Rp 200.000 dan deskripsi seperti "Beli gas LPG", "Beli minyak goreng", dll.

8. **Print/Download Laporan Kasir** menghasilkan struk thermal-style atau file PDF/Excel/Word dengan format:
  - Total Transaksi
  - Revenue
  - Refund (jika ada)
  - Pengeluaran (jika ada)
  - Net Revenue
  - Nama Kasir (multiple)
  - Section yang di-include sesuai checklist
  - Mapping qty, nominal, dan total sudah sesuai tampilan print HTML

9. **Checklist Section Download**: Section yang tidak dicentang tidak akan muncul di file download

10. **Validasi Nama Kasir**: Minimal 1 nama kasir wajib diisi untuk print/download laporan kasir

11. **Penghapusan Expenditure Tertentu**: Service AC dan Parkir tidak akan muncul di randomisasi pengeluaran

12. **Loading Spinner Preview**: Terdapat spinner saat proses kalkulasi preview

13. **UI/UX Batch Detail Modern**: Tampilan detail batch lebih rapi, informatif, dan responsif

---

## Daftar File

### Backend (gaspol-api)
| File | Status | Deskripsi |
|------|--------|-----------|
| `src/models/generated_revenue.js` | BARU | Model database |
| `src/controllers/revenueGeneratorController.js` | BARU | Controller API |
| `src/routes.js` | DIUBAH | Tambah routes |
| `src/controllers/downloadController.js` | BARU | Endpoint download PDF/Excel/Word |
| `src/utils/pdfGenerator.js` | BARU | Utility generate PDF |
| `src/utils/excelGenerator.js` | BARU | Utility generate Excel |
| `src/utils/wordGenerator.js` | BARU | Utility generate Word |

### Frontend (gaspol-cms)
| File | Status | Deskripsi |
|------|--------|-----------|
| `src/components/RevenueGenerator.js` | BARU | Komponen utama |
| `src/components/RevenueGeneratorDetailModal.js` | BARU | Modal detail |
| `src/components/RevenueGeneratorDownloadModal.js` | BARU | Modal download report (PDF/Excel/Word) |
| `src/components/common/Sidebar.js` | DIUBAH | Tambah menu |
| `src/App.js` | DIUBAH | Tambah route |

---

**Dokumentasi dibuat:** 31 Maret 2026  
**Versi:** 2.1.0  
**Update:**
- Penambahan fitur download report (PDF/Excel/Word) dengan checklist section
- Mapping qty/nominal sudah benar di semua format
- Validasi kasir pada print/download
- Penghapusan random expenditure tertentu
- Loading spinner pada preview kalkulasi
- UI/UX batch detail lebih modern
