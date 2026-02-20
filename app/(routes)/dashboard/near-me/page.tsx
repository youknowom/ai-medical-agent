"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
    MapPin, Star, Clock, Phone, Search, Navigation,
    CheckCircle2, ArrowLeft, Calendar, Globe, Stethoscope,
    X, Filter, RefreshCw, Loader2,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

// ── Dynamically import DoctorMap (no SSR – Leaflet is browser-only) ───────────
const DoctorMap = dynamic(() => import("@/components/DoctorMap"), {
    ssr: false,
    loading: () => (
        <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg,#e0f2fe,#f0f9ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "inherit",
        }}>
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        </div>
    ),
});

// ─── Types ────────────────────────────────────────────────────────────────────
type Doctor = {
    id: string | number;
    name: string;
    specialty: string;
    rating: number;
    reviews: number;
    distance: string;
    distanceNum: number;
    address: string;
    hospital: string;
    available: boolean;
    nextSlot: string;
    experience: string;
    fee: string;
    avatar: string;
    avatarBg: string;
    tagBg: string;
    verified: boolean;
    languages: string[];
    lat?: number;
    lng?: number;
};

// ─── Fallback mock ─────────────────────────────────────────────────────────────
const MOCK_DOCTORS: Doctor[] = [
    { id: 1, name: "Dr. Anjali Sharma", specialty: "General Physician", rating: 4.9, reviews: 312, distance: "0.4 km", distanceNum: 0.4, address: "Sector 18, Noida", hospital: "Apollo Clinic", available: true, nextSlot: "Today, 11:30 AM", experience: "14 yrs", fee: "₹500", avatar: "AS", avatarBg: "linear-gradient(135deg,#c4b5fd 0%,#6366f1 100%)", tagBg: "#ede9fe", verified: true, languages: ["Hindi", "English"] },
    { id: 2, name: "Dr. Rohan Mehta", specialty: "Cardiologist", rating: 4.8, reviews: 189, distance: "0.9 km", distanceNum: 0.9, address: "Vasant Kunj, Delhi", hospital: "Fortis Heart Centre", available: true, nextSlot: "Today, 2:00 PM", experience: "20 yrs", fee: "₹1,200", avatar: "RM", avatarBg: "linear-gradient(135deg,#fca5a5 0%,#dc2626 100%)", tagBg: "#fee2e2", verified: true, languages: ["English", "Marathi"] },
    { id: 3, name: "Dr. Priya Nair", specialty: "Dermatologist", rating: 4.7, reviews: 254, distance: "1.2 km", distanceNum: 1.2, address: "Green Park, Delhi", hospital: "Max Skin Clinic", available: false, nextSlot: "Tomorrow, 10:00 AM", experience: "10 yrs", fee: "₹800", avatar: "PN", avatarBg: "linear-gradient(135deg,#fdba74 0%,#ea580c 100%)", tagBg: "#ffedd5", verified: true, languages: ["Malayalam", "English", "Hindi"] },
    { id: 4, name: "Dr. Suresh Iyer", specialty: "Neurologist", rating: 4.9, reviews: 421, distance: "1.5 km", distanceNum: 1.5, address: "Ansari Nagar, Delhi", hospital: "AIIMS OPD Block", available: true, nextSlot: "Today, 4:30 PM", experience: "25 yrs", fee: "₹1,500", avatar: "SI", avatarBg: "linear-gradient(135deg,#6ee7b7 0%,#059669 100%)", tagBg: "#dcfce7", verified: true, languages: ["Tamil", "English"] },
    { id: 5, name: "Dr. Kavitha Reddy", specialty: "Gynecologist", rating: 4.6, reviews: 178, distance: "1.8 km", distanceNum: 1.8, address: "HSR Layout, Bangalore", hospital: "Narayana Women's Clinic", available: true, nextSlot: "Today, 6:00 PM", experience: "12 yrs", fee: "₹700", avatar: "KR", avatarBg: "linear-gradient(135deg,#d8b4fe 0%,#9333ea 100%)", tagBg: "#f3e8ff", verified: false, languages: ["Telugu", "Kannada", "English"] },
    { id: 6, name: "Dr. Aditya Singh", specialty: "Orthopedic", rating: 4.8, reviews: 305, distance: "2.1 km", distanceNum: 2.1, address: "Koramangala, Bangalore", hospital: "Bone & Joint Clinic", available: false, nextSlot: "Tomorrow, 9:00 AM", experience: "18 yrs", fee: "₹1,000", avatar: "AS", avatarBg: "linear-gradient(135deg,#67e8f9 0%,#0ea5e9 100%)", tagBg: "#e0f2fe", verified: true, languages: ["Hindi", "English"] },
];

const SORT_OPTIONS = [
    { label: "Nearest first", value: "distance" },
    { label: "Highest rated", value: "rating" },
    { label: "Available now", value: "available" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NearMePage() {
    const [search, setSearch] = useState("");
    const [availableOnly, setAvailableOnly] = useState(false);
    const [sortBy, setSortBy] = useState("distance");
    const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [selected, setSelected] = useState<Doctor | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
    const [loading, setLoading] = useState(false);
    const [liveData, setLiveData] = useState(false);

    // Ref for scrolling to selected card
    const cardRefs = useRef<Record<string | number, HTMLDivElement | null>>({});

    // ── Geolocation ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) { setLocationGranted(false); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocationGranted(true);
            },
            () => setLocationGranted(false),
            { timeout: 10000 }
        );
    }, []);

    // ── Fetch from OSM Overpass ───────────────────────────────────────────────
    const fetchDoctors = useCallback(async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `/api/nearby-doctors?lat=${lat}&lng=${lng}&radius=5000`,
                { timeout: 22000 }
            );
            if (data.doctors?.length > 0) {
                setDoctors(data.doctors);
                setLiveData(true);
            } else {
                setDoctors(MOCK_DOCTORS);
                setLiveData(false);
            }
        } catch {
            setDoctors(MOCK_DOCTORS);
            setLiveData(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (coords) fetchDoctors(coords.lat, coords.lng);
    }, [coords, fetchDoctors]);

    // ── Scroll to selected card ───────────────────────────────────────────────
    useEffect(() => {
        if (selected) {
            const el = cardRefs.current[selected.id];
            el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [selected]);

    // ── Filter + sort ─────────────────────────────────────────────────────────
    const filtered = doctors
        .filter(d => {
            const q = search.toLowerCase();
            return (
                d.name.toLowerCase().includes(q) ||
                d.specialty.toLowerCase().includes(q) ||
                d.hospital.toLowerCase().includes(q) ||
                d.address.toLowerCase().includes(q)
            ) && (!availableOnly || d.available);
        })
        .sort((a, b) => {
            if (sortBy === "distance") return a.distanceNum - b.distanceNum;
            if (sortBy === "rating") return b.rating - a.rating;
            if (sortBy === "available") return (b.available ? 1 : 0) - (a.available ? 1 : 0);
            return 0;
        });

    // ── Directions URL (Google Maps external redirect — no API key) ───────────
    const getDirectionsUrl = (doc: Doctor) => {
        if (doc.lat != null && doc.lng != null) {
            return `https://www.google.com/maps/dir/?api=1&destination=${doc.lat},${doc.lng}`;
        }
        // Fallback: search by name + address
        const q = encodeURIComponent(`${doc.name} ${doc.address}`);
        return `https://www.google.com/maps/search/?api=1&query=${q}`;
    };

    // ── Badge helpers ─────────────────────────────────────────────────────────
    const getBadge = (doc: Doctor, index: number) => {
        if (index === 0 && sortBy === "distance") return { label: "Closest", bg: "#fef3c7", color: "#92400e" };
        if (doc.distanceNum <= 1) return { label: "Within 1 km", bg: "#dcfce7", color: "#166534" };
        return null;
    };

    return (
        <div className="w-full" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>

            {/* ── HEADER ──────────────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.45 } }}>
                <Link href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors mb-6 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col gap-3 sm:gap-5 mb-6 sm:mb-8">
                    <div>
                        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400 mb-2">Near Me</p>
                        <h1 className="text-[2rem] sm:text-[2.75rem] font-semibold text-neutral-950 tracking-[-0.03em] leading-none">
                            Find Doctors<br />
                            <span className="text-sky-500">Near You</span>
                        </h1>
                        <p className="text-neutral-500 text-xs sm:text-sm mt-2 sm:mt-3 max-w-sm leading-relaxed">
                            {locationGranted === null
                                ? "Detecting your location…"
                                : locationGranted
                                    ? liveData
                                        ? "Showing real clinics & hospitals from OpenStreetMap."
                                        : "Showing sample doctors. Live data loading…"
                                    : "Enable location access for personalised nearby results."}
                        </p>
                    </div>

                    {/* Status pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold"
                            style={locationGranted
                                ? { background: "#dcfce7", color: "#166534" }
                                : locationGranted === false
                                    ? { background: "#fef3c7", color: "#92400e" }
                                    : { background: "#EAEAE7", color: "#555" }}>
                            <Navigation className="w-3.5 h-3.5" />
                            {locationGranted === null ? "Detecting…" : locationGranted ? "Location active" : "No location"}
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold"
                            style={liveData
                                ? { background: "#dbeafe", color: "#1e40af" }
                                : { background: "#EAEAE7", color: "#555" }}>
                            <Stethoscope className="w-3.5 h-3.5" />
                            {liveData ? "Live · OpenStreetMap" : "Sample data"}
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold"
                            style={{ background: "#EAEAE7", color: "#374151" }}>
                            <Clock className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                            {filtered.filter(d => d.available).length} available now
                        </div>

                        {coords && (
                            <button onClick={() => fetchDoctors(coords.lat, coords.lng)} disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                                style={{ background: "#111", color: "#fff" }}>
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ── TWO-COLUMN LAYOUT ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6 items-start">

                {/* ── LEFT: MAP + STATS ─────────────────────────────────────────── */}
                <div className="xl:sticky xl:top-6 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.1 } }}
                        className="rounded-[2rem] overflow-hidden h-[280px] sm:h-[380px] xl:h-[460px]"
                        style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)" }}
                    >
                        <DoctorMap
                            userCoords={coords}
                            doctors={filtered}
                            selected={selected}
                            onSelect={(doc: Doctor) => setSelected(selected?.id === doc.id ? null : doc)}
                        />
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { label: "Doctors found", value: String(filtered.length), color: "#6366f1" },
                            { label: "Available now", value: String(filtered.filter(d => d.available).length), color: "#22c55e" },
                            { label: "Avg. rating", value: filtered.length ? (filtered.reduce((s, d) => s + d.rating, 0) / filtered.length).toFixed(1) + " ★" : "—", color: "#f59e0b" },
                        ].map((s, i) => (
                            <motion.div key={s.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 + i * 0.07 } }}
                                className="rounded-2xl p-2 sm:p-4 text-center"
                                style={{ background: "#EAEAE7", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)" }}>
                                <p className="text-lg sm:text-2xl font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
                                <p className="text-[9px] sm:text-[11px] text-neutral-500 mt-0.5 sm:mt-1 font-medium">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Selected doctor detail panel */}
                    <AnimatePresence>
                        {selected && (
                            <motion.div
                                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                                className="rounded-[2rem] p-6 relative"
                                style={{ background: "#0f172a", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}
                            >
                                <button onClick={() => setSelected(null)}
                                    className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                    style={{ color: "rgba(255,255,255,0.4)" }}>
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                                        style={{ background: selected.avatarBg }}>
                                        {selected.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-base text-white">{selected.name}</h3>
                                            {selected.verified && <CheckCircle2 className="w-4 h-4" style={{ color: "#86efac" }} />}
                                        </div>
                                        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                                            {selected.specialty}{selected.experience !== "N/A" ? ` · ${selected.experience} exp` : ""}
                                        </p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-3.5 h-3.5" style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                                            <span className="text-sm font-semibold text-white">{selected.rating}</span>
                                            {selected.reviews > 0 && (
                                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>({selected.reviews} reviews)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    <InfoRow icon={<MapPin className="w-3.5 h-3.5" />}
                                        text={`${selected.hospital}${selected.address ? ", " + selected.address : ""}`} />
                                    <InfoRow icon={<Clock className="w-3.5 h-3.5" />}
                                        text={selected.available ? `Open now · ${selected.nextSlot}` : `Next: ${selected.nextSlot}`} />
                                    <InfoRow icon={<Globe className="w-3.5 h-3.5" />}
                                        text={`Speaks: ${selected.languages.join(", ")}`} />
                                    <InfoRow icon={<Phone className="w-3.5 h-3.5" />} text={`Fee: ${selected.fee}`} />
                                </div>

                                <div className="flex gap-3">
                                    {/* Directions → Google Maps external link (no API key) */}
                                    <a
                                        href={getDirectionsUrl(selected)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white text-center transition-all hover:opacity-90 flex items-center justify-center gap-2"
                                        style={{ background: "linear-gradient(135deg,#38bdf8,#2563eb)" }}
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Directions
                                    </a>
                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${selected.lat ?? coords?.lat}&mlon=${selected.lng ?? coords?.lng}#map=16/${selected.lat ?? coords?.lat}/${selected.lng ?? coords?.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/10 flex items-center gap-2"
                                        style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                                        <MapPin className="w-4 h-4" />
                                        View Map
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── RIGHT: SEARCH + DOCTOR LIST ───────────────────────────────── */}
                <div className="flex flex-col gap-4">

                    {/* Search bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.15 } }}
                        className="flex gap-3"
                    >
                        <div className="flex flex-1 items-center gap-3 px-4 py-3.5 rounded-2xl"
                            style={{ background: "#EAEAE7", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                            <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search doctors, specialties, hospitals…"
                                className="flex-1 bg-transparent outline-none text-sm text-neutral-900 placeholder:text-neutral-400" />
                            {search && (
                                <button onClick={() => setSearch("")} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all"
                            style={showFilters
                                ? { background: "#111", color: "#fff" }
                                : { background: "#EAEAE7", color: "#374151", boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" }}>
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </motion.div>

                    {/* Collapsible filter panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="rounded-2xl p-5 space-y-5"
                                    style={{ background: "#EAEAE7", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-3">Sort by</p>
                                        <div className="flex flex-wrap gap-2">
                                            {SORT_OPTIONS.map(o => (
                                                <button key={o.value} onClick={() => setSortBy(o.value)}
                                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                                                    style={sortBy === o.value
                                                        ? { background: "#111", color: "#fff" }
                                                        : { background: "rgba(0,0,0,0.06)", color: "#555" }}>
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-neutral-800">Available now only</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">Show only currently open doctors</p>
                                        </div>
                                        <button onClick={() => setAvailableOnly(!availableOnly)}
                                            className="relative w-12 h-6 rounded-full transition-colors duration-200"
                                            style={{ background: availableOnly ? "#111" : "#d1d5db" }}>
                                            <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200"
                                                style={{ left: availableOnly ? "1.625rem" : "0.25rem" }} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick sort pills */}
                    {!showFilters && (
                        <div className="flex gap-2 flex-wrap">
                            {SORT_OPTIONS.map(o => (
                                <button key={o.value} onClick={() => setSortBy(o.value)}
                                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                                    style={sortBy === o.value
                                        ? { background: "#111", color: "#fff" }
                                        : { background: "#EAEAE7", color: "#555", boxShadow: "0 0 0 1px rgba(0,0,0,0.07)" }}>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results label */}
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs text-neutral-400 font-medium">
                            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs font-medium" style={{ color: liveData ? "#2563eb" : "#9ca3af" }}>
                            {liveData ? "● Live · OpenStreetMap" : "● Sample data"}
                        </p>
                    </div>

                    {/* Loading skeletons */}
                    {loading && (
                        <div className="flex flex-col gap-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="rounded-2xl animate-pulse"
                                    style={{ background: "#EAEAE7", height: "108px" }} />
                            ))}
                        </div>
                    )}

                    {/* Doctor cards */}
                    {!loading && (
                        <div className="flex flex-col gap-3">
                            <AnimatePresence mode="popLayout">
                                {filtered.length === 0 ? (
                                    <motion.div key="empty"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="rounded-2xl p-12 text-center" style={{ background: "#EAEAE7" }}>
                                        <Search className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                                        <p className="text-neutral-500 text-sm font-medium">No doctors found</p>
                                        <p className="text-neutral-400 text-xs mt-1">Try adjusting your search or filters</p>
                                    </motion.div>
                                ) : (
                                    filtered.map((doc, i) => {
                                        const badge = getBadge(doc, i);
                                        const isSelected = selected?.id === doc.id;
                                        return (
                                            <motion.div
                                                key={doc.id}
                                                layout
                                                ref={el => { cardRefs.current[doc.id] = el; }}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.04 } }}
                                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                                onClick={() => setSelected(isSelected ? null : doc)}
                                                className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                                                style={{
                                                    background: isSelected ? "#0f172a" : "#EAEAE7",
                                                    boxShadow: isSelected
                                                        ? "0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.06)"
                                                        : "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)",
                                                }}
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    {/* Avatar */}
                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                                                        style={{ background: doc.avatarBg }}>
                                                        {doc.avatar}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                                            <h3 className="font-semibold text-sm tracking-tight truncate"
                                                                style={{ color: isSelected ? "#fff" : "#111" }}>
                                                                {doc.name}
                                                            </h3>
                                                            {doc.verified && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0"
                                                                    style={{ color: isSelected ? "#86efac" : "#22c55e" }} />
                                                            )}
                                                            {badge && (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
                                                                    style={isSelected
                                                                        ? { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }
                                                                        : { background: badge.bg, color: badge.color }}>
                                                                    {badge.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs truncate"
                                                            style={{ color: isSelected ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                                                            {doc.hospital}{doc.address ? ` · ${doc.address}` : ""}
                                                        </p>
                                                        <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                                            style={isSelected
                                                                ? { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }
                                                                : { background: doc.tagBg, color: "#374151" }}>
                                                            {doc.specialty}
                                                        </span>
                                                    </div>

                                                    {/* Right column */}
                                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                                            style={doc.available
                                                                ? (isSelected
                                                                    ? { background: "rgba(134,239,172,0.15)", color: "#86efac" }
                                                                    : { background: "#dcfce7", color: "#166534" })
                                                                : (isSelected
                                                                    ? { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }
                                                                    : { background: "rgba(0,0,0,0.06)", color: "#9ca3af" })}>
                                                            {doc.available ? "● Open" : "Closed"}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3" style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                                                            <span className="text-xs font-semibold"
                                                                style={{ color: isSelected ? "#fff" : "#374151" }}>
                                                                {doc.rating}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] font-medium"
                                                            style={{ color: isSelected ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                                                            {doc.distance}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Slot row */}
                                                <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t text-xs"
                                                    style={{ borderColor: isSelected ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
                                                    <Calendar className="w-3.5 h-3.5"
                                                        style={{ color: isSelected ? "rgba(255,255,255,0.35)" : "#9ca3af" }} />
                                                    <span style={{ color: isSelected ? "rgba(255,255,255,0.45)" : "#6b7280" }}>
                                                        {doc.available ? "Open now" : "Next:"}
                                                    </span>
                                                    <span className="font-semibold"
                                                        style={{ color: isSelected ? "rgba(255,255,255,0.9)" : "#111" }}>
                                                        {doc.nextSlot}
                                                    </span>
                                                    <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
                                                        style={isSelected
                                                            ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                                                            : { background: "#111", color: "#fff" }}>
                                                        View
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>{icon}</span>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{text}</p>
        </div>
    );
}