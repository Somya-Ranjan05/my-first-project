# 🎯 ApexMatch • Smart Campus Lost & Found with AI-Powered Item Matching

A full-stack, multimodal campus Lost & Found web application. Students and staff can report lost or found items with photo uploads. The system uses vision models to auto-extract structured item attributes (color, brand, unique marks, material), generates semantic vector embeddings, and executes a multi-signal matching engine to pair lost and found reports with confidence scores (0-100%) and natural-language explanations.

---

## ✨ Features

1. **Submission Flow with AI Vision Scanner**:
   - Upload item photos with drag-and-drop.
   - Real-time vision analysis extracts item type, color, brand, material, and distinguishing marks.
   - User-editable attribute confirmation chips.
   - Interactive campus location picker mapped to real campus buildings and geographic coordinates.

2. **Multi-Signal AI Matching Engine**:
   - **Vector Cosine Similarity (40%)**: Dense semantic embeddings comparing combined title, description, and extracted attributes.
   - **Metadata & Visual Attribute Match (25%)**: Evaluates category match, color overlap, brand alignment, and unique marks.
   - **Campus Geolocation Proximity (20%)**: Haversine distance decay function calibrated across campus zones.
   - **Time Delta Proximity (15%)**: Temporal decay scoring based on the time elapsed between lost and found timestamps.
   - **Natural Language Match Explanation**: Generates human-readable rationales (e.g. *"Both reports describe a black Nike backpack with a broken zipper, found near the library within 2 hours of the reported loss time..."*).

3. **Natural Language Semantic Search**:
   - Users can query with conversational language like *"blue water bottle with stickers near the gym"* or *"silver apple laptop left in engineering"*.
   - Returns items ranked by vector cosine similarity with percentage match badges.

4. **Side-by-Side Match Review Dashboard**:
   - Split view of Lost Item vs Found Item with photo zoom.
   - Score breakdown meters (Vector, Metadata, Location, Time).
   - Instant **Confirm Match** action (marks both items as resolved with confetti animation) and **Dismiss Match**.

5. **In-App Match Notifications**:
   - Triggers simulated alerts whenever a submitted item crosses the 75% confidence threshold.

6. **Interactive Campus Geolocation Map**:
   - Visual campus blueprint showing lost/found cluster counts across campus zones and buildings.

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React (Vite) + Tailwind CSS                     │
│  - Report Submission Flow (Vision Dropzone & Auto-Attribute Suggestion)│
│  - Interactive Campus Map & Location Picker                            │
│  - Semantic Natural Language & Filtered Search                         │
│  - Side-by-Side Match Review Dashboard (Claim / Confirm / Dismiss)    │
│  - Real-Time / In-App Notification Center for High-Confidence Matches   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Node.js / Express Backend                       │
│  - REST Endpoints (/api/reports, /api/matches, /api/search, /api/seed) │
│  - File Upload Handler (local /uploads with S3-ready abstraction)      │
│  - SQLite Database (Node 24 native node:sqlite / DatabaseSync)         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
┌───────────────────▼────────────────┐   ┌───────────▼───────────────────┐
│     AI Matching Engine Module      │   │       AI Provider Layer       │
│  - Vector Cosine Similarity (40%)  │   │  - Gemini / OpenAI Vision &   │
│  - Attribute & Category Match (25%)│   │    Text Embeddings            │
│  - Campus Geolocation Proximity(20%)│  │  - Natural Language Match     │
│  - Temporal Decay Scoring (15%)    │   │    Explanation Generator      │
│  - Confidence Scoring (0-100%)     │   │  - Local Zero-Key Fallback    │
└────────────────────────────────────┘   └───────────────────────────────┘
```

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Multer, `node:sqlite`.
- **Database**: SQLite (local zero-setup) with PostgreSQL / `pgvector` compatible schema.
- **AI Providers**: Google Gemini (`@google/generative-ai`) and OpenAI (`openai`), with an **Intelligent Local Semantic Engine Fallback** that operates offline without API keys.

---

## ⚙️ Configuration & API Keys

ApexMatch operates immediately **out-of-the-box** using its built-in local semantic vector generator and heuristic vision parser.

To enable live Google Gemini or OpenAI multimodal processing, create a `.env` file in the `server/` folder:

```bash
# server/.env

PORT=5000

# Option A: Google Gemini (Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Option B: OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```

### 2. Run the Benchmark Matching Test
```bash
npm run test:matching
```

### 3. Seed Sample Campus Data
```bash
npm run seed
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🧮 Matching Engine Formula

The overall confidence score $S_{\text{match}} \in [0, 100]$ is computed as:

$$S_{\text{match}} = \Big(w_{\text{vec}} S_{\text{vec}} + w_{\text{meta}} S_{\text{meta}} + w_{\text{loc}} S_{\text{loc}} + w_{\text{time}} S_{\text{time}}\Big) \times C_{\text{gate}} \times 100$$

Where:
- $w_{\text{vec}} = 0.40$ (Cosine similarity of dense text embeddings: $\frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$)
- $w_{\text{meta}} = 0.25$ (Category exactness + color overlap + brand alignment + unique marks)
- $w_{\text{loc}} = 0.20$ (Haversine distance decay across campus coordinates)
- $w_{\text{time}} = 0.15$ (Exponential/step temporal proximity decay)
- $C_{\text{gate}}$: Category compatibility gating multiplier (0.35 if hard category mismatch)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reports/analyze-photo` | Pre-flight AI Vision attribute extraction from image |
| `POST` | `/api/reports` | Create lost or found report & trigger matching engine |
| `GET` | `/api/reports` | Get filtered reports list (`type`, `category`, `status`, `location`) |
| `GET` | `/api/reports/:id` | Get report details + its top ranked candidate matches |
| `POST` | `/api/search/semantic` | Natural language semantic query vector search |
| `GET` | `/api/matches` | Get high confidence matches across campus |
| `POST` | `/api/matches/:id/confirm` | Confirm match & mark both reports as resolved |
| `POST` | `/api/matches/:id/dismiss` | Dismiss match suggestion |
| `POST` | `/api/matches/recalculate` | Recalculate pairwise matches across all open reports |
| `GET` | `/api/notifications` | Get in-app match alerts |
| `POST` | `/api/seed` | 1-Click reset & reload demo dataset |
| `GET` | `/api/locations` | Get campus locations list and geographic coordinates |

---

## 📦 PostgreSQL + pgvector Migration

To deploy to production with PostgreSQL and `pgvector`:
1. Enable extension: `CREATE EXTENSION IF NOT EXISTS vector;`
2. Change the `embedding` column in `reports` from `TEXT` to `vector(1536)` (or `vector(768)` for Gemini).
3. Query nearest neighbors using Cosine Distance operator:
   ```sql
   SELECT * FROM reports
   WHERE type != 'lost' AND status = 'open'
   ORDER BY embedding <=> $1
   LIMIT 10;
   ```
