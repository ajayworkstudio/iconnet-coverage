// Logika cek coverage: ambil KML dari Google My Maps, ubah ke GeoJSON,
// lalu cek titik pelanggan ada di polygon mana.
import { DOMParser } from "@xmldom/xmldom";
import { kml as kmlToGeoJSON } from "@tmcw/togeojson";

const DEFAULT_MID = "1owHzAMBV20UGvmig3hL5ERXGjj_nUXI";
const CACHE_MS = 60 * 60 * 1000; // 1 jam

let cache = { at: 0, areas: null, mid: null };

export function kmlUrl(mid = process.env.MAP_MID || DEFAULT_MID) {
  return `https://www.google.com/maps/d/kml?mid=${encodeURIComponent(mid)}&forcekml=1`;
}

/* ---------- Status dari warna polygon (legenda peta) ---------- */
// Hijau 0-10%, Hijau muda 20-30%, Kuning 40-50%, Oranye 60-70%, Merah 80-90%, Hitam 100%
const LEVELS = {
  green:  { key: "green",  label: "0–10% terisi",  color: "#0F9D58", full: false },
  lime:   { key: "lime",   label: "20–30% terisi", color: "#7CB342", full: false },
  yellow: { key: "yellow", label: "40–50% terisi", color: "#F9A825", full: false },
  orange: { key: "orange", label: "60–70% terisi", color: "#EF6C00", full: false },
  red:    { key: "red",    label: "80–90% terisi", color: "#D32F2F", full: false },
  black:  { key: "black",  label: "100% penuh",    color: "#111111", full: true  },
};

export function levelFromHex(hex) {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max < 70) return LEVELS.black;
  if (max - min < 25) return null; // abu-abu / putih: tidak ada di legenda
  let h;
  const d = max - min;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h >= 340 || h < 18) return LEVELS.red;
  if (h < 42) return LEVELS.orange;
  if (h < 68) return LEVELS.yellow;
  if (h < 105) return LEVELS.lime;
  if (h < 175) return LEVELS.green;
  return null; // biru/ungu: bukan warna status
}

function hexFromFeature(f) {
  const p = f.properties || {};
  if (typeof p.fill === "string") return p.fill;
  // My Maps menaruh warna di id style: #poly-FFEA00-1200-77
  const m = /poly-([0-9A-Fa-f]{6})/.exec(p.styleUrl || "");
  return m ? "#" + m[1] : null;
}

/* ---------- Ambil & parse KML ---------- */
export function parseAreas(kmlText) {
  const dom = new DOMParser().parseFromString(kmlText, "text/xml");
  const gj = kmlToGeoJSON(dom);
  const areas = [];
  for (const f of gj.features) {
    const polys = polygonsOf(f.geometry);
    if (!polys.length) continue;
    const hex = hexFromFeature(f);
    areas.push({
      name: (f.properties?.name || "Tanpa nama").trim(),
      level: levelFromHex(hex),
      polys,
      bbox: bboxOf(polys),
    });
  }
  return areas;
}

function polygonsOf(g) {
  if (!g) return [];
  if (g.type === "Polygon") return [g.coordinates];
  if (g.type === "MultiPolygon") return g.coordinates;
  if (g.type === "GeometryCollection") return g.geometries.flatMap(polygonsOf);
  return [];
}

function bboxOf(polys) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const p of polys) for (const [x, y] of p[0]) {
    if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y;
  }
  return [a, b, c, d];
}

export async function loadAreas({ force = false } = {}) {
  const mid = process.env.MAP_MID || DEFAULT_MID;
  if (!force && cache.areas && cache.mid === mid && Date.now() - cache.at < CACHE_MS) {
    return { areas: cache.areas, fetchedAt: cache.at };
  }
  try {
    const res = await fetch(kmlUrl(mid), { headers: { "user-agent": "iconnet-coverage/1.0" } });
    if (!res.ok) throw new Error(`Google My Maps membalas ${res.status}`);
    const text = await res.text();
    const areas = parseAreas(text);
    if (!areas.length) throw new Error("Tidak ada polygon di peta");
    cache = { at: Date.now(), areas, mid };
  } catch (err) {
    if (!cache.areas) throw err; // pakai data lama kalau ada
  }
  return { areas: cache.areas, fetchedAt: cache.at };
}

/* ---------- Geometri ---------- */
function inRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inPolygon(pt, poly) {
  if (!inRing(pt, poly[0])) return false;
  for (let k = 1; k < poly.length; k++) if (inRing(pt, poly[k])) return false; // lubang
  return true;
}

// Jarak titik ke tepi polygon (meter), pendekatan equirectangular: akurat untuk jarak < puluhan km.
function distToPolysM([lng, lat], polys) {
  const kx = 111320 * Math.cos((lat * Math.PI) / 180), ky = 110574;
  let best = Infinity;
  for (const poly of polys) for (const ring of poly) {
    for (let i = 0; i < ring.length - 1; i++) {
      const ax = (ring[i][0] - lng) * kx, ay = (ring[i][1] - lat) * ky;
      const bx = (ring[i + 1][0] - lng) * kx, by = (ring[i + 1][1] - lat) * ky;
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      let t = L ? -(ax * dx + ay * dy) / L : 0;
      t = Math.max(0, Math.min(1, t));
      const px = ax + t * dx, py = ay + t * dy;
      const dist = Math.sqrt(px * px + py * py);
      if (dist < best) best = dist;
    }
  }
  return best;
}

export function checkPoint(areas, lat, lng) {
  const pt = [lng, lat];
  const hits = areas.filter(a => {
    const [x1, y1, x2, y2] = a.bbox;
    return lng >= x1 && lng <= x2 && lat >= y1 && lat <= y2 && a.polys.some(p => inPolygon(pt, p));
  });
  if (hits.length) {
    // Kalau tumpang tindih, utamakan area yang masih punya slot dan paling longgar
    const order = ["green", "lime", "yellow", "orange", "red", "black"];
    hits.sort((a, b) => rank(a) - rank(b));
    function rank(a) { const i = order.indexOf(a.level?.key); return i < 0 ? 99 : i; }
    const top = hits[0];
    return {
      covered: true,
      available: top.level ? !top.level.full : null,
      area: { name: top.name, status: top.level },
      otherAreas: hits.slice(1).map(a => ({ name: a.name, status: a.level })),
    };
  }
  let nearest = null;
  for (const a of areas) {
    const d = distToPolysM(pt, a.polys);
    if (!nearest || d < nearest.distanceM) nearest = { name: a.name, status: a.level, distanceM: d };
  }
  if (nearest) nearest.distanceM = Math.round(nearest.distanceM);
  return { covered: false, available: false, area: null, nearest };
}

/* ---------- Baca input lokasi ---------- */
// Terima "-7.13, 110.40", link Google Maps (…@-7.13,110.40…, ?q=-7.13,110.40, !3d-7.13!4d110.40)
export function parseLocation(text) {
  if (!text) return null;
  const s = decodeURIComponent(String(text)).replace(/\s+/g, " ");
  const pats = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /@(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /[?&](?:q|query|ll|destination|center)=(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/,
    /^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/,
    /(-?\d{1,2}\.\d{3,})\s*[, ]\s*(-?\d{2,3}\.\d{3,})/,
  ];
  for (const re of pats) {
    const m = re.exec(s);
    if (m) {
      const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
      if (valid(lat, lng)) return { lat, lng };
    }
  }
  return null;
}

export function valid(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

// Link pendek (maps.app.goo.gl) perlu diikuti redirect-nya dulu
export async function resolveShortLink(text) {
  const m = /https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps)\/[\w-]+/i.exec(text || "");
  if (!m) return null;
  try {
    const res = await fetch(m[0], { redirect: "follow" });
    const loc = parseLocation(res.url);
    if (loc) return loc;
    const html = await res.text();
    return parseLocation(html.slice(0, 200000));
  } catch { return null; }
}
