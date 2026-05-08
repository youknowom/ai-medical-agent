# MediPulse AI — Complete Project Documentation

> **For new developers.** This document covers every module, API route, data flow, AI model, database schema, and component so you can understand the full app in one read.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Auth** | Clerk (`@clerk/nextjs`) |
| **Database** | Neon (serverless PostgreSQL) |
| **ORM** | Drizzle ORM (`drizzle-orm/neon-http`) |
| **AI – Chat/Text** | OpenRouter → DeepSeek Chat V3 |
| **AI – Vision (Image)** | OpenRouter → Llama 3.2 Vision (waterfall) |
| **AI – Voice Agent** | Vapi (`@vapi-ai/web`) + OpenAI GPT-4o |
| **AI – NLP Extract** | OpenRouter → Llama 3 8B |
| **AI – Doctor Suggest** | OpenRouter → Gemini 2.5 Flash Lite |
| **Maps** | Leaflet + react-leaflet + OpenStreetMap (Overpass API) |
| **OCR** | Tesseract.js (v7) |
| **PDF Export** | jspdf + html2canvas |
| **UI** | Tailwind CSS, shadcn/ui, Radix Dialog, framer-motion |
| **Icons** | lucide-react, @tabler/icons-react |
| **HTTP Client** | axios |
| **Toast** | sonner |
| **Analytics** | @vercel/analytics |

---

## 🗂️ Project Folder Structure

```
ai-health-care/
│
├── app/
│   ├── layout.tsx                    ← Root layout: Clerk, Provider, Analytics, Toaster
│   ├── provider.tsx                  ← Auto-registers user in DB on login
│   ├── middleware.ts                 ← Clerk auth middleware: protects /dashboard/*
│   │
│   ├── api/                          ← All server-side Next.js API routes
│   │   ├── medical-report-scan/      ← POST: AI analysis of uploaded medical reports
│   │   ├── nearby-doctors/           ← GET:  OpenStreetMap proxy with 2-min cache
│   │   ├── nlp-extract/              ← POST: Extract medical symptoms from text
│   │   ├── session-chat/             ← GET + POST: Session CRUD in Neon DB
│   │   ├── suggest-doctors/          ← POST: AI recommends doctor specialty from symptoms
│   │   └── users/                    ← POST: Upsert user in DB after Clerk login
│   │
│   └── (routes)/
│       ├── (auth)/                   ← Clerk sign-in / sign-up pages
│       └── dashboard/
│           ├── layout.tsx            ← Dashboard layout: sidebar + header
│           ├── page.tsx              ← Home: session history + doctor agent list
│           ├── _components/          ← Shared dashboard UI components
│           │   ├── AppHeader.tsx
│           │   ├── AddNewSessionDialog.tsx   ← 2-step "Start Consultation" modal
│           │   ├── DoctorsAgentList.tsx      ← Grid of 10 AI doctor agent cards
│           │   ├── DoctorAgentCard.tsx       ← Single card + DoctorAgent type export
│           │   ├── SuggestedDoctorCard.tsx   ← Selectable card after AI suggestion
│           │   ├── HistoryList.tsx           ← Past sessions list
│           │   └── MLFeaturesGrid.tsx        ← Feature highlights
│           │
│           ├── medical-agent/[sessionId]/
│           │   └── page.tsx          ← Vapi voice call UI for selected doctor session
│           │
│           ├── ocr-analysis/
│           │   └── page.tsx          ← MediScan AI: upload report + chat with AI
│           │
│           ├── near-me/
│           │   └── page.tsx          ← Live doctor map (OSM) + doctor card list
│           │
│           ├── history/
│           │   └── page.tsx          ← Full session history list
│           │
│           └── billing/
│               └── page.tsx          ← Billing / credits page
│
├── components/
│   ├── DoctorMap.tsx                 ← Leaflet map (SSR disabled via dynamic import)
│   └── ui/                           ← shadcn/ui: Button, Dialog, Textarea, etc.
│
├── config/
│   ├── db.tsx                        ← Neon + Drizzle DB connection
│   ├── schema.tsx                    ← DB table definitions
│   └── OpenAiModel.tsx               ← OpenRouter client + AI model constants
│
├── shared/
│   └── list.tsx                      ← AIDoctorAgents: 10 specialist agent definitions
│
├── types/
│   ├── index.ts                      ← Re-exports
│   └── session.ts                    ← SessionDetail, Message types
│
├── public/
│   ├── doctor1.png – doctor10.png    ← Doctor avatar images
│   ├── mediscan-avatar.png           ← MediScan female AI avatar
│   ├── call-start.wav / call-end.wav ← Vapi call audio cues
│   └── success.wav                   ← Doctor suggestion success sound
│
├── middleware.ts                     ← Clerk route guard
├── next.config.ts                    ← Next.js config (currently minimal)
├── drizzle.config.ts                 ← Drizzle Kit (migrations)
└── .env.local                        ← All secrets (never commit!)
```

---

## 🔐 Environment Variables

Create `.env.local` in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon PostgreSQL
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require

# OpenRouter (AI models: DeepSeek, Llama Vision, Gemini)
OPEN_ROUTER_API_KEY=sk-or-...

# Vapi (Voice AI)
NEXT_PUBLIC_VAPI_API_KEY=...
```

---

## 🔑 Authentication Flow (Clerk)

```
User visits /dashboard/*
        │
        ▼
middleware.ts (Clerk matcher)
  ├── Not signed in? → redirect to /sign-in
  └── Signed in?     → allow through
        │
        ▼
app/provider.tsx (client wrapper around entire app)
  └── useEffect: user signed in?
        └── POST /api/users   ← upserts user in Neon DB
              └── returns user row { id, name, email, credits }
```

**Key files:**
- `middleware.ts` — `clerkMiddleware()`, protects all `/dashboard` routes
- `app/provider.tsx` — fires `/api/users` on every mount after sign-in
- `app/layout.tsx` — wraps entire app in `<ClerkProvider>`

---

## 🗄️ Database Schema (Neon + Drizzle)

### `users` table

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` PK | Auto-increment identity |
| `name` | `varchar(255)` | Full name from Clerk |
| `email` | `varchar(255)` | Unique, primary identifier |
| `credits` | `integer` | Default 10 on creation |

### `sessionChatTable` table

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` PK | Auto-increment identity |
| `sessionId` | `varchar` | UUID v4 generated at creation |
| `notes` | `text` | User's symptom description |
| `selectedDoctor` | `json` | Full `DoctorAgent` object |
| `conversation` | `json` | Reserved (future transcript storage) |
| `report` | `json` | Reserved (future report storage) |
| `createdBy` | `varchar` | FK → `users.email` |
| `createdOn` | `varchar` | ISO date string |

---

## 🤖 AI Models Configuration

**File:** `config/OpenAiModel.tsx`

All AI calls use the **OpenRouter** gateway (`https://openrouter.ai/api/v1`) via the standard OpenAI SDK.

```
OpenRouter (single OPEN_ROUTER_API_KEY)
  ├── DEEPSEEK_MODEL     → "deepseek/deepseek-chat"
  │                            Used for: text chat, PDF OCR analysis
  │
  ├── VISION_MODELS[0]   → "meta-llama/llama-3.2-11b-vision-instruct:free"
  ├── VISION_MODELS[1]   → "qwen/qwen2-vl-7b-instruct:free"
  ├── VISION_MODELS[2]   → "meta-llama/llama-3.2-90b-vision-instruct"  (paid fallback)
  │                            Used for: image/X-ray report analysis (waterfall order)
  │
  └── FREE_TEXT_FALLBACK → "qwen/qwen-2.5-72b-instruct:free"
                               Used for: if DeepSeek fails
```

**Vision waterfall logic:** `callVisionModelWithFallback()` tries each model in sequence. If a model returns empty content or throws, it moves to the next. First successful response wins.

---

## 📡 API Routes — Full Reference

---

### 1. `POST /api/medical-report-scan`

**Purpose:** Core of MediScan AI — analyzes medical reports (images or OCR'd text/PDF).

**Request body:**
```json
{
  "message": "Please analyze this report",
  "fileData": "data:image/jpeg;base64,...",  // optional
  "fileType": "image/jpeg",                  // optional
  "conversationHistory": [                   // for multi-turn context
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Decision flow:**
```
Has fileData + image MIME type?
  └── YES → callVisionModelWithFallback()
              Llama 3.2 11B Vision → Qwen2-VL 7B → Llama 90B
              Returns { content: string, model: string }

  └── NO (text/PDF) → DeepSeek Chat V3
                         Fallback: Qwen 2.5 72B if DeepSeek fails
```

**Response:**
```json
{
  "response": "Structured markdown analysis...",
  "model": "deepseek/deepseek-chat"
}
```

**Error responses:**
- `400` — No message provided
- `503` — All AI models exhausted / failed
- `500` — Unexpected server error

**System prompt scope:** Strictly medical. Non-medical questions → polite decline + redirect.

---

### 2. `GET /api/nearby-doctors`

**Purpose:** Fetches live healthcare facilities near the user's GPS location via OpenStreetMap Overpass API.

**Query params:**
```
?lat=28.6139&lng=77.2090&radius=5000
```

**Flow:**
```
In-memory cache check (2-minute TTL, keyed by "lat,lng,radius")
  │
  ├── CACHE HIT  → return cached data + header X-Cache: HIT
  │
  └── CACHE MISS → POST https://overpass-api.de/api/interpreter
                     Overpass QL query: amenity=hospital|clinic|doctors + nodes + ways
                     Timeout: 20 seconds
                      │
                      └── Map each OSM element to Doctor object:
                            Real fields: name, lat, lng, phone, website, openingHours, address
                            Derived: specialty, rating (seeded by OSM id), available, avatar, avatarBg
                      │
                      ├── Haversine formula: calculate distance from user coords
                      ├── Sort: nearest first
                      ├── Limit: top 20 results
                      └── Store in cache → respond
```

**Response:**
```json
{
  "doctors": [
    {
      "id": 12345678,
      "name": "Apollo Clinic",
      "specialty": "General Practice",
      "rating": 4.7,
      "reviews": 120,
      "distance": "1.2 km",
      "distanceNum": 1.2,
      "lat": 28.6100,
      "lng": 77.2090,
      "available": true,
      "nextSlot": "Available today",
      "hospital": "Apollo",
      "address": "MG Road, Delhi",
      "avatar": "AC",
      "avatarBg": "linear-gradient(...)",
      "fee": "₹500",
      "verified": true
    }
  ],
  "total": 8,
  "source": "osm"
}
```

> **License requirement:** OpenStreetMap data is licensed under ODbL. The UI must display "© OpenStreetMap contributors" attribution.

---

### 3. `POST /api/nlp-extract`

**Purpose:** Extracts medical symptoms/entities from raw text (called after Tesseract OCR on PDF).

**Request:**
```json
{ "text": "Patient presents with fever 38.5°C, headache, and dry cough for 3 days" }
```

**Response:**
```json
{ "entities": ["fever", "headache", "dry cough"] }
```

**Model:** `meta-llama/llama-3-8b-instruct` via OpenRouter direct fetch (not the SDK).

**Fallback parsing:** If the model wraps the array in markdown, a regex `\[[\s\S]*\]` extracts it before `JSON.parse`.

---

### 4a. `POST /api/session-chat` — Create new consultation session

**Purpose:** Creates a session row in the DB when a user starts a consultation.

**Request:**
```json
{
  "notes": "I have chest pain and breathlessness for 2 days",
  "selectedDoctor": {
    "id": 1,
    "specialist": "General Physician",
    "agentPrompt": "You are a friendly GP...",
    "image": "/doctor1.png"
  }
}
```

**Flow:**
1. Validates `notes` + `selectedDoctor` present
2. Authenticates via Clerk `currentUser()` → 401 if not logged in
3. Generates `sessionId = uuidv4()`
4. Inserts into `sessionChatTable`
5. Returns `{ sessionId: "uuid-string" }`

**Used by:** `AddNewSessionDialog.tsx` → redirects to `/dashboard/medical-agent/{sessionId}`

---

### 4b. `GET /api/session-chat` — Fetch sessions

| Query | Behaviour |
|---|---|
| `?sessionId=all` | Returns all sessions for authenticated user, ordered by newest |
| `?sessionId={uuid}` | Returns exact session, validates `createdBy = user.email` |

**Security:** Row-level ownership enforced via `WHERE createdBy = user.email` on every query.

---

### 5. `POST /api/suggest-doctors`

**Purpose:** AI matches user symptoms to 1–3 of the 10 predefined specialist agents.

**Request:**
```json
{ "notes": "severe headaches and blurry vision for past week" }
```

**Flow:**
```
notes + AIDoctorAgents array (as system message)
  └── Gemini 2.5 Flash Lite (via OpenRouter)
        Model returns raw JSON array of 1–3 DoctorAgent objects
        Strip markdown code fences (```json ... ```)
        JSON.parse
        Return { message: [DoctorAgent, ...] }
```

**Used by:** Step 1 of `AddNewSessionDialog.tsx` → renders `SuggestedDoctorCard` for each.

---

### 6. `POST /api/users`

**Purpose:** Creates or returns a user record in the DB linked to their Clerk identity.

**Flow:**
1. `currentUser()` from Clerk → get name + email
2. `SELECT` from `usersTable WHERE email = user.email`
3. If not found → `INSERT` with `credits: 10`
4. Returns the user row

**Called by:** `app/provider.tsx` on every page load after sign-in.

---

## 🗺️ All Page Routes

---

### `/dashboard` — Home

**Renders:**
- `AddNewSessionDialog` — "Start New Consultation" button + 2-step dialog
- `MLFeaturesGrid` — feature highlight cards
- `HistoryList` — `GET /api/session-chat?sessionId=all` → past sessions
- `DoctorsAgentList` — 10 AI doctor agent cards from `shared/list.tsx`

---

### `/dashboard/medical-agent/[sessionId]` — Voice AI Call

**Full call flow:**
```
1. GET /api/session-chat?sessionId={id}
     └── Load session { notes, selectedDoctor }

2. User clicks "Start Call"
     └── new Vapi(NEXT_PUBLIC_VAPI_API_KEY)
           │
           vapi.start({
             name: "AI Medical Doctor Voice Agent",
             firstMessage: "Hello! Please tell me your name and age...",
             transcriber: {
               provider: "assembly-ai",
               language: "en"             ← ⚠️ BUG: should be "multilingual"
             },
             voice: {
               provider: "vapi",
               voiceId: doctor.voiceId    ← ⚠️ BUG: always undefined (commented out)
                         || "Elliot"      ← ⚠️ "Elliot" is not a valid Vapi voice ID
             },
             model: {
               provider: "openai",
               model: "gpt-4o",
               messages: [{ role: "system", content: doctor.agentPrompt }]
             }
           })

3. Events wired:
     call-start       → callStarted=true, timer starts
     message          → partial transcripts shown live, final added to messages[]
     speech-start/end → updates currentRole ("assistant" / "user")
     call-end         → resets state, plays end sound
     error            → shows error banner, ends call
```

---

### `/dashboard/ocr-analysis` — MediScan AI

**Accepted file inputs:**
| Type | Processing |
|---|---|
| JPEG / PNG / WEBP | `FileReader.readAsDataURL` → base64 → vision model |
| PDF | `Tesseract.js` in-browser OCR → text → DeepSeek |
| No file (text only) | Direct text → DeepSeek |

**Message rendering:**
- Each AI response shown as a chat bubble with: timestamp, model badge, Dr. Meera avatar
- Typing indicator (animated dots) while API call is in flight
- "Export PDF" button: `html2canvas` → `jsPDF` → download `MediScan-Report.pdf`

---

### `/dashboard/near-me` — Nearby Doctors

**State machine:**
```
locationGranted === null → GPS Waiting (radar animation)
locationGranted === false → GPS Denied (empty state)
locationGranted === true →
  loading → 5x skeleton card loaders
  loaded  → compact map (220px) at top + doctor card list below
             click card → detail drawer (slides from right on desktop, bottom sheet on mobile)
             click map pin → same drawer
```

**Filters available:**
- Search (name, specialty, hospital, address)
- Sort: Nearest / Top Rated / Available
- Toggle: Open now only
- Specialty chips: All | GP | Cardiology | Dermatology | Neurology | Gynecology | Orthopedics | Internal Medicine | Multi-Speciality

**Fallback:** If API returns 0 results or fails → shows sample `MOCK_DOCTORS` data with an amber "Sample Data" badge.

---

### `/dashboard/history` — Past Sessions

Full list of all user sessions. Clicking a row navigates back to that session's voice agent page.

---

### `/dashboard/billing` — Credits & Plans

Static page showing credit balance and upgrade options.

---

## 🩺 AI Doctor Agent Definitions (`shared/list.tsx`)

10 specialist agents. Each defined as:

```ts
type DoctorAgent = {
  id: number;
  specialist: string;          // "General Physician", "Cardiologist", etc.
  description: string;         // Short card subtitle
  image: string;               // "/doctor1.png" → "/doctor10.png"
  agentPrompt: string;         // System prompt fed to GPT-4o via Vapi
  // voiceId: string;          // ⚠️ COMMENTED OUT ON ALL 10 — needs to be restored
  subscriptionRequired: boolean; // true for all except General Physician (id:1)
};
```

| # | Specialist | Voice Needed | Free? |
|---|---|---|---|
| 1 | General Physician | Charlie | ✅ Yes |
| 2 | Pediatrician | Beth | ❌ No |
| 3 | Dermatologist | Bex UK Female | ❌ No |
| 4 | Psychologist | Beth | ❌ No |
| 5 | Nutritionist | Will | ❌ No |
| 6 | Cardiologist | Charlie | ❌ No |
| 7 | ENT Specialist | Will | ❌ No |
| 8 | Orthopedic | Charlie | ❌ No |
| 9 | Gynecologist | Beth | ❌ No |
| 10 | Dentist | Bex UK Female | ❌ No |

---

## 🔁 Full User Journey (End-to-End)

```
1. Visit app
   Clerk middleware → /sign-in if not authenticated

2. Sign in (Google / Email via Clerk)
   provider.tsx → POST /api/users → upsert in Neon DB (10 credits assigned)

3. /dashboard loads
   HistoryList → GET /api/session-chat?sessionId=all → past sessions shown
   DoctorsAgentList → 10 agent cards rendered

4. "Start New Consultation" clicked
   AddNewSessionDialog (Step 1):
     User types symptoms → "Find Doctors"
     POST /api/suggest-doctors → Gemini 2.5 Flash matches 1–3 agents

   AddNewSessionDialog (Step 2):
     User picks a doctor → "Start Consultation"
     POST /api/session-chat → creates DB row → returns sessionId
     Redirect to /dashboard/medical-agent/{sessionId}

5. Voice Call page
   GET /api/session-chat?sessionId=... → loads doctor + notes
   "Start Call" → Vapi SDK → GPT-4o real-time voice conversation
   Transcript shown live, messages history stored in state

6. /dashboard/ocr-analysis
   Upload image → base64 → POST /api/medical-report-scan → vision model → markdown response
   Upload PDF → Tesseract OCR → POST /api/medical-report-scan → DeepSeek → markdown response
   Text only → POST /api/medical-report-scan → DeepSeek → response
   Export button → PDF download

7. /dashboard/near-me
   Browser GPS permission → GET /api/nearby-doctors
   OSM Overpass API fetches real clinics
   Map (Leaflet) + cards below
   Click card → detail drawer → "Get Directions" → Google Maps
```

---

## ⚠️ Known Bugs & Issues

| # | Bug | File | Line | Fix Required |
|---|---|---|---|---|
| 1 | `voiceId` commented out — ALL 10 doctors have `undefined` voiceId | `shared/list.tsx` | 111–201 | Restore `voiceId` field with valid Vapi voice IDs |
| 2 | Vapi transcriber hardcoded `language: "en"` — Hindi/Hinglish input fails | `medical-agent/[sessionId]/page.tsx` | 130 | Change to `"multilingual"` |
| 3 | Vapi dashboard assistant (`1931a90f-...`) never invoked — config is all inline | `medical-agent/[sessionId]/page.tsx` | 194 | Either use `vapi.start("assistantId")` or keep inline but sync prompts |
| 4 | `provider.tsx` calls `/api/users` on every app mount (no debounce/cache) | `app/provider.tsx` | — | Add `sessionStorage` flag or Clerk metadata check |
| 5 | `gpt-5` referenced in Vapi dashboard but code correctly uses `gpt-4o` | `medical-agent/[sessionId]/page.tsx` | 138 | Keep `gpt-4o` — GPT-5 doesn't exist in API |
| 6 | Leaflet CSS was in root layout (now fixed via `near-me/layout.tsx`) | `app/layout.tsx` | — | ✅ Fixed |

---

## 🧩 Component Dependency Graph

```
app/layout.tsx
  └── ClerkProvider
        └── Provider (provider.tsx → POST /api/users)
              └── [all routes]
                    └── Toaster (sonner)

dashboard/page.tsx
  ├── AddNewSessionDialog.tsx
  │     ├── POST /api/suggest-doctors
  │     ├── SuggestedDoctorCard.tsx
  │     └── POST /api/session-chat → navigate to /medical-agent/{id}
  ├── HistoryList.tsx
  │     └── GET /api/session-chat?sessionId=all
  ├── DoctorsAgentList.tsx
  │     └── DoctorAgentCard.tsx (links to /medical-agent/{id} directly)
  └── MLFeaturesGrid.tsx

dashboard/medical-agent/[sessionId]/page.tsx
  ├── GET /api/session-chat?sessionId={id}
  └── @vapi-ai/web SDK
        └── Inline config → GPT-4o model
              └── Real-time transcript UI

dashboard/ocr-analysis/page.tsx
  ├── Tesseract.js (browser OCR for PDF)
  └── POST /api/medical-report-scan
        └── config/OpenAiModel.tsx
              ├── DEEPSEEK_MODEL (text path)
              └── VISION_MODELS[] waterfall (image path)

dashboard/near-me/page.tsx
  ├── GET /api/nearby-doctors
  │     └── OpenStreetMap Overpass API
  └── components/DoctorMap.tsx (dynamic import, SSR=false)
        └── react-leaflet + Leaflet.js
```

---

## 🚀 Quick Start

```bash
# 1. Clone and install
npm install

# 2. Create .env.local with all required keys (see Environment Variables above)

# 3. Push schema to Neon DB
npx drizzle-kit push

# 4. Start development server
npm run dev

# App runs at http://localhost:3000
```

### First-time setup checklist

- [ ] Clerk project created → keys in `.env.local`
- [ ] Neon database created → `DATABASE_URL` in `.env.local`
- [ ] `npx drizzle-kit push` run → `users` and `sessionChatTable` created
- [ ] OpenRouter account → `OPEN_ROUTER_API_KEY` in `.env.local`
- [ ] Vapi account → `NEXT_PUBLIC_VAPI_API_KEY` in `.env.local`
- [ ] `public/` folder has `doctor1.png` through `doctor10.png`
- [ ] `public/mediscan-avatar.png` exists (MediScan AI avatar)
- [ ] `public/call-start.wav`, `call-end.wav`, `success.wav` exist

---

## 📋 Vapi Dashboard vs Code Discrepancy

Your Vapi dashboard assistant (`1931a90f-2094-4353-b387-34e7f1ef36ca`) has a rich Hinglish prompt and is configured with GPT-5 + AssemblyAI. However, **this assistant is never called by the code**. The code creates its own inline config every time.

To use your dashboard assistant, change line 194 in `page.tsx`:
```ts
// Instead of:
const call = await vapi.start(VapiAgentConfig as any);

// Use your dashboard assistant directly:
const call = await vapi.start("1931a90f-2094-4353-b387-34e7f1ef36ca");
```

This will load all your Vapi dashboard settings (voice, transcriber, model, prompt) automatically.

---

*Last updated: February 2026 · MediPulse v1.0*
