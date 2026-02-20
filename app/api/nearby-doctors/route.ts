import { NextRequest, NextResponse } from "next/server";

// ── Simple in-memory cache (2-minute TTL) ─────────────────────────────────────
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

// ── Haversine distance in km ──────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Avatar initials ───────────────────────────────────────────────────────────
function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

// ── Deterministic helpers ────────────────────────────────────────────────────
const GRADIENTS = [
    "linear-gradient(135deg,#c4b5fd 0%,#6366f1 100%)",
    "linear-gradient(135deg,#fca5a5 0%,#dc2626 100%)",
    "linear-gradient(135deg,#fdba74 0%,#ea580c 100%)",
    "linear-gradient(135deg,#6ee7b7 0%,#059669 100%)",
    "linear-gradient(135deg,#d8b4fe 0%,#9333ea 100%)",
    "linear-gradient(135deg,#67e8f9 0%,#0ea5e9 100%)",
    "linear-gradient(135deg,#fde68a 0%,#d97706 100%)",
    "linear-gradient(135deg,#a5f3fc 0%,#0891b2 100%)",
];
const TAG_BGS = ["#ede9fe", "#fee2e2", "#ffedd5", "#dcfce7", "#f3e8ff", "#e0f2fe", "#fef3c7", "#cffafe"];
const SPECIALTIES = [
    "General Practice", "Cardiology", "Dermatology", "Neurology",
    "Orthopedics", "Pediatrics", "Gynecology", "Internal Medicine",
];
const RATINGS = [4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
const SLOTS = [
    "Today, 10:00 AM", "Today, 12:30 PM", "Today, 3:00 PM",
    "Today, 5:30 PM", "Tomorrow, 9:00 AM", "Tomorrow, 11:00 AM",
];

function seededPick<T>(arr: T[], seed: number): T {
    return arr[Math.abs(seed) % arr.length];
}

// ── Main ──────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");
    const radius = parseInt(searchParams.get("radius") ?? "5000");

    if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    // ── Check cache ───────────────────────────────────────────────────────────
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json(cached.data, {
            headers: { "X-Cache": "HIT" },
        });
    }

    // ── Overpass QL query ─────────────────────────────────────────────────────
    const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["healthcare"="doctor"](around:${radius},${lat},${lng});
      node["amenity"="doctors"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
    );
    out center 20;
  `;

    try {
        const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
            signal: AbortSignal.timeout(20_000),
        });

        if (!res.ok) throw new Error(`Overpass responded with ${res.status}`);

        const data = await res.json();
        const elements: any[] = data.elements ?? [];

        const doctors = elements
            .filter((el) => {
                const elLat = el.lat ?? el.center?.lat;
                const elLng = el.lon ?? el.center?.lon;
                return el.tags?.name && elLat != null && elLng != null;
            })
            .slice(0, 20)
            .map((el, i) => {
                const elLat: number = el.lat ?? el.center.lat;
                const elLng: number = el.lon ?? el.center.lon;
                const distKm = Math.round(haversine(lat, lng, elLat, elLng) * 10) / 10;

                const tags = el.tags ?? {};
                const name = tags.name ?? "Nearby Medical Centre";
                const seed = typeof el.id === "number" ? el.id : i + 1;

                const specialty =
                    tags["healthcare:speciality"] ??
                    tags["healthcare_speciality"] ??
                    (tags.amenity === "hospital" ? "Multi-Speciality Hospital" : seededPick(SPECIALTIES, seed));

                const address = [
                    tags["addr:street"],
                    tags["addr:suburb"] ?? tags["addr:city"],
                ]
                    .filter(Boolean)
                    .join(", ") || "Local Area";

                const available = seed % 3 !== 0;
                const rating = seededPick(RATINGS, seed + 3);
                const reviews = ((seed * 37) % 200) + 10;

                return {
                    id: el.id,
                    name,
                    specialty,
                    rating,
                    reviews,
                    distance: `${distKm} km`,
                    distanceNum: distKm,
                    address,
                    hospital: tags.operator ?? name,
                    available,
                    nextSlot: available ? seededPick(SLOTS, seed) : seededPick(SLOTS.slice(4), seed),
                    experience: "10+ yrs",
                    fee: "Varies",
                    avatar: getInitials(name),
                    avatarBg: seededPick(GRADIENTS, seed),
                    tagBg: seededPick(TAG_BGS, seed),
                    verified: true,
                    languages: ["English", "Hindi"],
                    // ✅ Include real coordinates for map markers + Directions link
                    lat: elLat,
                    lng: elLng,
                };
            })
            .sort((a, b) => a.distanceNum - b.distanceNum);

        const result = { doctors, total: doctors.length, source: "osm" };

        // ── Store in cache ────────────────────────────────────────────────────
        cache.set(cacheKey, { data: result, ts: Date.now() });

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Overpass API error:", err?.message ?? err);
        return NextResponse.json(
            { error: "Failed to fetch nearby doctors from OpenStreetMap", details: err?.message },
            { status: 500 }
        );
    }
}