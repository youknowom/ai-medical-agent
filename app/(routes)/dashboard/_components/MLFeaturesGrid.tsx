"use client";

import {
    Brain,
    FileText,
    MapPin,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
    {
        id: 1,
        name: "AI Doctor Consultation",
        description:
            "Talk to a specialist AI. Describe symptoms by voice or text — get instant evidence-based guidance powered by BioBERT.",
        icon: Brain,
        graphicBg: "linear-gradient(135deg, #c4b5fd 0%, #818cf8 50%, #6366f1 100%)",
        accentColor: "#6366f1",
        tag: "Voice + Text",
        route: "/dashboard/medical-agent/f4550f15-e61d-4a25-aeec-8814e24078c3",
        bullets: [
            "Real-time speech recognition",
            "98% symptom extraction accuracy",
            "10 specialist AI doctors",
        ],
    },
    {
        id: 2,
        name: "Near Me Doctor",
        description:
            "Find verified doctors and clinics near you instantly. Filter by specialty and book appointments in a single tap.",
        icon: MapPin,
        graphicBg: "linear-gradient(135deg, #67e8f9 0%, #38bdf8 50%, #0ea5e9 100%)",
        accentColor: "#0ea5e9",
        tag: "GPS Powered",
        route: "/dashboard/near-me",
        bullets: [
            "Live GPS location search",
            "Verified credentials & reviews",
            "One-tap appointments",
        ],
    },
    {
        id: 3,
        name: "Scan Medical Reports",
        description:
            "Upload any lab report, prescription, or X-ray image. AI extracts every key value and explains results in plain language.",
        icon: FileText,
        graphicBg: "linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #059669 100%)",
        accentColor: "#059669",
        tag: "OCR + AI",
        route: "/dashboard/ocr-analysis",
        bullets: [
            "PDF & image OCR extraction",
            "X-ray CNN anomaly detection",
            "Plain English explanations",
        ],
    },
];

export default function MLFeaturesGrid() {
    return (
        <div className="w-full">
            {/* Section header */}
            <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400 mb-3">
                    AI-Powered Tools
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold text-neutral-950 tracking-[-0.025em]">
                    What can I help you with?
                </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f, i) => (
                    <FeatureCard key={f.id} feature={f} index={i} />
                ))}
            </div>
        </div>
    );
}

function FeatureCard({
    feature,
    index,
}: {
    feature: (typeof features)[0];
    index: number;
}) {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.45, delay: index * 0.07 } }}
        >
            <Link href={feature.route} className="block group h-full">
                <div
                    className="h-full rounded-[1.10rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                        background: "#EAEAE7",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)",
                    }}
                >
                    {/* Graphic top panel */}
                    <div
                        className="h-40 flex items-center justify-center relative overflow-hidden"
                        style={{ background: feature.graphicBg }}
                    >
                        <Icon className="w-14 h-14 text-white/25" />
                        {/* Decorative inner glow */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse at 50% 120%, rgba(255,255,255,0.22) 0%, transparent 60%)",
                            }}
                        />
                        {/* Tag pill inside the graphic */}
                        <span
                            className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                            style={{
                                background: "rgba(0,0,0,0.22)",
                                color: "rgba(255,255,255,0.9)",
                                backdropFilter: "blur(6px)",
                            }}
                        >
                            {feature.tag}
                        </span>
                    </div>

                    {/* Text body */}
                    <div className="p-5 flex flex-col h-[calc(100%-10rem)]">
                        <h3 className="font-semibold text-neutral-900 text-base mb-2 tracking-tight">
                            {feature.name}
                        </h3>
                        <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                            {feature.description}
                        </p>

                        {/* Bullet points */}
                        <ul className="space-y-1.5 mb-5 flex-1">
                            {feature.bullets.map((b) => (
                                <li key={b} className="flex items-center gap-2">
                                    <span className="text-green-500 text-xs">✦</span>
                                    <span className="text-xs text-neutral-600">{b}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 group-hover:gap-2.5 transition-all duration-200 mt-auto">
                            Try now <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
