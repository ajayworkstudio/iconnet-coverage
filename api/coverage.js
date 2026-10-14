// GET /api/coverage?lat=-7.13&lng=110.40
// GET /api/coverage?q=<koordinat atau link Google Maps>
import { loadAreas, checkPoint, parseLocation, resolveShortLink, valid } from "../lib/coverage.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOW_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Gunakan GET." });

  const { lat, lng, q } = req.query || {};
  let loc = null;
  if (lat != null && lng != null) {
    const a = parseFloat(lat), b = parseFloat(lng);
    if (valid(a, b)) loc = { lat: a, lng: b };
  } else if (q) {
    loc = parseLocation(q) || (await resolveShortLink(q));
  }
  if (!loc) {
    return res.status(400).json({
      ok: false,
      error: "Lokasi tidak terbaca. Kirim koordinat seperti -7.1390, 110.4050 atau link Google Maps.",
    });
  }

  try {
    const { areas, fetchedAt } = await loadAreas();
    const result = checkPoint(areas, loc.lat, loc.lng);
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json({
      ok: true,
      location: loc,
      ...result,
      areaCount: areas.length,
      dataUpdatedAt: new Date(fetchedAt).toISOString(),
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "Peta coverage belum bisa dibaca: " + err.message });
  }
}
