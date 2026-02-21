import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{
        background: "#F2F2EF",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* ── Gradient blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, #fdba74 0%, #fcd34d 35%, transparent 70%)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute -top-10 -left-40 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, #c4b5fd 0%, #a5b4fc 50%, transparent 70%)",
            opacity: 0.45,
          }}
        />
        <div
          className="absolute -top-10 -right-40 w-[450px] h-[450px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, #93c5fd 0%, #bfdbfe 50%, transparent 70%)",
            opacity: 0.4,
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-[250px]"
          style={{ background: "linear-gradient(to bottom, transparent, #F2F2EF)" }}
        />
      </div>

      {/* ── Navbar ── */}
      <nav
        className="relative z-20 flex items-center justify-between px-6 sm:px-10 h-14 border-b"
        style={{
          background: "rgba(242,242,239,0.85)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(0,0,0,0.07)",
        }}
      >
        <Link href="/" className="text-xl font-bold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity">
          medipulse
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-neutral-500">Already have an account?</span>
          <Link href="/sign-in">
            <button
              className="px-4 py-2 rounded-full text-sm font-semibold text-neutral-900 transition-all hover:bg-white"
              style={{
                background: "rgba(255,255,255,0.6)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            >
              Sign in →
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">

        {/* Heading above the card */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-400 mb-3">
            India&apos;s AI Medical Platform
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-neutral-950 tracking-[-0.035em] leading-[1.05]">
            Create account
          </h1>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            Free to start — no credit card needed
          </p>
        </div>

        {/* Clerk card — card shell hidden, blends into page */}
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full max-w-[400px]",

              // ── Kill the white card box ──
              card: [
                "shadow-none",
                "border-0",
                "bg-transparent",
                "p-0",
                "gap-4",
                "w-full",
              ].join(" "),

              // ── Hide Clerk's own header ──
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              header: "hidden",

              // ── Social button ──
              socialButtonsBlockButton: [
                "w-full h-12 rounded-2xl border text-sm font-medium",
                "text-neutral-800 transition-all",
                "hover:bg-white hover:border-neutral-300",
              ].join(" "),
              socialButtonsBlockButtonText: "font-medium text-sm text-neutral-700",

              // ── Divider ──
              dividerRow: "my-1",
              dividerLine: "bg-neutral-200",
              dividerText: "text-neutral-400 text-xs px-3",

              // ── Form section ──
              formContainer: "rounded-2xl p-6 w-full",

              // ── Labels ──
              formFieldLabel: "text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 mb-1",

              // ── Inputs ──
              formFieldInput: [
                "w-full h-11 rounded-xl border border-neutral-200",
                "bg-white text-sm text-neutral-900",
                "placeholder:text-neutral-400",
                "focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900",
                "transition-all px-4",
              ].join(" "),
              formFieldInputShowPasswordButton: "text-neutral-400 hover:text-neutral-700",

              // ── Primary button ──
              formButtonPrimary: [
                "w-full h-11 rounded-xl mt-1",
                "bg-neutral-950 hover:opacity-85",
                "text-white text-sm font-semibold",
                "transition-opacity shadow-none",
              ].join(" "),

              // ── Footer ──
              footer: "mt-0 pt-4 border-t border-neutral-200/60 bg-transparent",
              footerAction: "text-center",
              footerActionText: "text-sm text-neutral-500",
              footerActionLink: "text-neutral-900 font-semibold hover:opacity-70 transition-opacity ml-1",

              // ── Error ──
              formFieldErrorText: "text-red-500 text-xs mt-1",
              alert: "rounded-xl border border-red-200 bg-red-50",
              alertText: "text-red-600 text-sm",

              // ── Internal ──
              main: "gap-5 w-full",
              form: "gap-4",
            },
            layout: {
              socialButtonsPlacement: "top",
            },
          }}
        />

        {/* Trust badges */}
        <div className="mt-6 flex items-center gap-6">
          {[
            { icon: "🔒", label: "Secure & private" },
            { icon: "🇮🇳", label: "Made in India" },
            { icon: "⚡", label: "Free to start" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-5 text-[11px] text-neutral-400 text-center max-w-xs leading-relaxed">
          AI guidance only — not a substitute for professional medical advice.
        </p>
      </main>

      {/* ── ECG line ── */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 opacity-[0.05] z-0">
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-14">
          <polyline
            points="0,30 100,30 135,30 158,6 182,54 205,12 228,30 328,30 363,30 386,6 410,54 433,12 456,30 556,30 591,30 614,6 638,54 661,12 684,30 784,30 819,30 842,6 866,54 889,12 912,30 1012,30 1047,30 1070,6 1094,54 1117,12 1140,30 1200,30"
            fill="none"
            stroke="#111"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}