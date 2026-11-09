# Import Menu Excel

## Alur

1. Pilih outlet.
2. Download **Export Excel** bila ingin mengubah menu yang sudah ada.
3. Edit data, lalu upload melalui **Batch Menu**.
4. Periksa preview; pilih `upsert` atau `skip`; simpan.

## Kolom

- `Menu ID (jangan diubah)`: terisi otomatis pada file **Export**. Pertahankan untuk update/rename. Kosongkan saat menambah menu baru → backend membuat ID baru otomatis.
- `Nama Menu *`, `Tipe Menu *`, `Nama Varian`, `Status Menu`, `Harga Dasar *`.
- Kolom `Harga: <Serving Type>`: harga per serving type.

Satu menu dapat memakai banyak baris. Baris tanpa varian adalah harga utama. Baris dengan nama menu + varian sama adalah varian menu tersebut.

## Anti-duplikasi

- `Menu ID` hanya berlaku pada outlet file sedang diimport. Pada outlet asal, ID mempertahankan update walau nama menu diganti.
- File export dari outlet lain boleh langsung diimport: ID lama tidak pernah mengubah outlet asal; backend mencocokkan nama unik pada outlet tujuan atau membuat menu baru.
- Tanpa `Menu ID`, backend hanya mencocokkan nama yang sudah unik pada outlet.
- Bila nama pada outlet tujuan sudah duplikat, import ditolak agar tidak salah update.
- Nama baru tanpa ID membuat menu baru.

## Mode

Kolom `Status Menu` pada Excel menyediakan pilihan `Aktif`/`Tidak Aktif`; nilai legacy `1`/`0` juga diterima. Kosong berarti `Aktif`.

- `upsert`: buat menu baru atau update menu/varian/harga yang cocok.
- `skip`: lewati seluruh grup menu yang sudah ada; menu baru tetap dibuat.

Import tidak menghapus varian/harga lama yang tidak tercantum. Hapus via editor menu bila memang diperlukan.

## Konsistensi

- Validasi dilakukan sebelum transaksi.
- Satu baris invalid → seluruh batch dibatalkan.
- Backend memakai lock per outlet, transaksi atomic, retry lock transient, idempotency key.
- Export read-only; tidak mengubah data/sync version.

## Dampak POS

Import sukses dengan perubahan aktual menaikkan `menu_version` sekali untuk outlet terkait. POS mendeteksi manifest berbeda saat sync berikutnya, lalu memperbarui menu, serving price, serta varian. Import replay/no-op/rollback tidak menaikkan versi.
