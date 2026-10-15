# ICONNET Coverage Check

Halaman marketer ICONNET dan API cek coverage. Datanya dibaca langsung dari peta Google My Maps "Peta Coverage Iconnet Semarang".

## Isi project

| File | Fungsi |
|---|---|
| `index.html` | Halaman marketer (Active/Passive) dengan tombol **Cek coverage** |
| `api/coverage.js` | Endpoint `GET /api/coverage` |
| `lib/coverage.js` | Logika ambil KML, point-in-polygon, baca warna status |
| `test/` | Tes dengan KML contoh (`npm test`) |

## Deploy ke Vercel

1. Upload folder ini ke repo GitHub, misalnya `iconnet-coverage`.
2. Di vercel.com, pilih **Add New → Project**, lalu import repo tersebut.
   - Framework Preset: **Other**. Build command dan output directory dibiarkan kosong.
3. Klik **Deploy**. Halaman bisa dibuka di `https://<nama-project>.vercel.app`.

Kalau pakai CLI: `npm i -g vercel`, lalu jalankan `vercel` dari folder ini.

## Pemakaian API

```
GET /api/coverage?lat=-7.1035&lng=110.2780
GET /api/coverage?q=-7.1035, 110.2780
GET /api/coverage?q=https://maps.app.goo.gl/xxxx    (link share Google Maps juga bisa)
```

Contoh jawaban:

```json
{
  "ok": true,
  "location": { "lat": -7.1035, "lng": 110.278 },
  "covered": true,
  "available": true,
  "area": {
    "name": "TK 4_RJBTG_Kendal_9 Desa Salamsari",
    "status": { "key": "yellow", "label": "40–50% terisi", "color": "#F9A825", "full": false }
  },
  "otherAreas": [],
  "areaCount": 24,
  "dataUpdatedAt": "2026-10-14T14:42:35.925Z"
}
```

- `covered`: titik berada di dalam salah satu polygon.
- `available`: bernilai `false` kalau area berwarna hitam (100% penuh). Bernilai `null` kalau warna area tidak ada di legenda.
- Kalau tidak tercover, jawaban berisi `nearest` dengan nama area terdekat dan `distanceM` (jarak ke tepi area, dalam meter).

## Cara kerja

- KML diambil dari `https://www.google.com/maps/d/kml?mid=<MAP_MID>&forcekml=1` lalu disimpan di memori selama 1 jam. Perubahan di My Maps paling lambat sekitar 1 jam baru terbaca.
- Status dibaca dari warna polygon sesuai legenda peta:

| Warna | Status |
|---|---|
| Hijau | 0–10% |
| Hijau muda | 20–30% |
| Kuning | 40–50% |
| Oranye | 60–70% |
| Merah | 80–90% |
| Hitam | 100% (penuh) |

  Pakai warna bawaan My Maps yang jelas berbeda supaya terbaca dengan benar. Warna biru atau ungu dianggap "status belum ada".
- Kalau titik masuk ke beberapa area yang tumpang tindih, API memilih area yang paling longgar.
- API hanya mengembalikan nama area dan status. Bentuk polygon tidak ikut terkirim ke pengguna.

## Widget untuk situs lain (misalnya jatengwifipln.com)

Tempel dua baris ini di HTML halaman, di tempat widget mau muncul:

```html
<div id="iconnet-cek"></div>
<script src="https://iconnet-coverage.vercel.app/widget.js" defer></script>
```

Opsi tambahan di `div`:
- `data-wa="6281339646353"` untuk nomor WhatsApp tujuan.
- `data-title="Cek jaringan ICONNET"` untuk mengganti judul widget.

Contoh tampilannya ada di `/contoh-widget.html`. Widget memakai font Plus Jakarta Sans kalau situsnya sudah memuat font itu. Kalau belum, widget memakai font sistem.

## Pengaturan (Environment Variables di Vercel)

| Nama | Default | Keterangan |
|---|---|---|
| `MAP_MID` | `1owHzAMBV20UGvmig3hL5ERXGjj_nUXI` | ID peta My Maps yang dipakai |
| `ALLOW_ORIGIN` | `*` | Batasi domain yang boleh memanggil API, misalnya `https://wfc.vercel.app` |

## Syarat peta

Peta My Maps harus bisa dibuka publik (**Anyone with the link can view**). Kalau peta dibuat privat, API tidak bisa membaca KML-nya.
