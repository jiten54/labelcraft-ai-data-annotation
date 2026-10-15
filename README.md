# LabelCraft AI — Data Annotation & Quality Assurance Platform

> Production-grade data annotation and quality assurance workspace built specifically for the **Codefeast Data Annotator (Fresher)** specification.

[![Vitest Automated Tests](https://img.shields.io/badge/Vitest-11%2F11%20Passing-emerald)](package.json)
[![Pytest Tests](https://img.shields.io/badge/Pytest-Passing-blue)](backend/test_app.py)
[![React](https://img.shields.io/badge/React-19-blue)](src/App.tsx)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-indigo)](tsconfig.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-teal)](src/index.css)

---

## 1. Project Overview & Problem Statement

Machine learning models are critically dependent on the quality, consistency, and fidelity of their training data. In real-world data labeling workflows, raw datasets frequently arrive with missing values, corrupt encodings, ambiguous sarcastic expressions, contradictory human labels, and duplicate primary identifiers.

**LabelCraft AI** solves this by providing a unified, ergonomic data annotation workspace equipped with:
1. Strict guideline taxonomy enforcement
2. An automated Quality Assurance (QA) rule engine
3. Gold-standard ground truth benchmarking
4. An immutable audit trail
5. Production-grade export pipelines (clean CSV & structured JSON)

---

## 2. Key Features

### 📊 Interactive Operations Dashboard
- Real-time KPI counters: Total records imported, records annotated, awaiting labeling, requiring review, and flagged/rejected.
- Dynamic charts (via Recharts) breaking down annotation status, topic distribution, QA defect categories, and velocity.
- **Dataset Quality Health Score (0-100)** computed dynamically from active defects and unresolved review items.

### 🗂️ Dataset Management & Strict Schema Validator
- Ingest raw CSV and JSON text datasets and image manifests (`id`, `image_url`, `title`).
- Pre-import validation engine detecting missing required columns, empty payloads, and duplicate primary keys with exact row numbers.
- Sample dataset generators: download clean CSV and JSON template files directly from the UI.
- Never accepts or pretends an import was successful if parsing or validation fails.

### ✍️ Ergonomic Text Annotation Workspace
- **Sentiment Classification:** Positive, Negative, Neutral, Unclear (Hotkeys: `1`, `2`, `3`, `4`).
- **Topic Categorization:** Technology, Education, Healthcare, Finance, Entertainment, Other (Hotkeys: `Q`, `W`, `E`, `R`, `T`, `Y`).
- **Content Review & Relevance:** Relevant, Irrelevant, Needs Review.
- Annotator notes field with quick-insert tags (`+Sarcasm / Irony`, `+Mixed polarity`, `+Missing context`).
- Ambiguity toggle switch to route edge cases to the supervisor queue (`A`).
- **Embedded Guidelines Drawer:** Slide-over reference manual accessible directly inside the labeling view (`G`) without losing state.
- Original source preservation: raw input data is kept strictly untouched.

### 🖼️ Image & Vision Annotation Workspace
- Image classification: primary scene domain and 4-tier visual quality assessment (High Quality, Acceptable, Blurry / Low Res, Watermarked / Occluded).
- Corrupted/unclear image toggle with graceful fallback UI for broken image links.
- **Interactive Bounding Box Tool:** Click-and-drag to draw rectangular bounding boxes on images with customizable category taxonomy (`Laptop / Device`, `Person / Face`, `Vehicle`, `Document`, `Furniture`).

### 🛡️ Automated Quality Assurance Engine
- Scans all records for:
  - Missing annotations
  - Invalid taxonomy labels
  - Duplicate record IDs
  - Contradictory annotations (e.g. marked Positive sentiment but filled with severe grievance keywords)
  - Incomplete fields
  - Suspicious sentiment inconsistencies
  - Unresolved review flags
- Review queue allowing supervisors to **Approve**, **Reject**, or **Request Correction** with mandatory decision justification notes.

### 🎯 Gold-Standard Evaluation Benchmarks
- Paired statistical evaluation against verified reference labels curated by senior lead annotators.
- Computes:
  - **Accuracy**
  - **Macro Precision**
  - **Macro Recall**
  - **Macro F1-Score**
  - **Interactive Confusion Matrix** (Actual Ground Truth vs Predicted Matrix)
- Explicitly reports **"Not evaluated"** for unverified records instead of fabricating scores.

### 📜 Immutable Audit Trail
- Logs record ID, timestamp, operator tag, previous value, new value, action performed, and review notes.
- Searchable and exportable to CSV and JSON.

### 💾 Export Center
- One-click export for:
  - Full annotated dataset (CSV & JSON)
  - Clean approved records only (filtered and sanitized for model training)
  - Needs-review queue (for supervisor handoff)
  - QA defect audit report

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts
- **Testing:** Vitest (Frontend), Pytest (Backend API)
- **Backend Deliverable:** Python 3.11+, FastAPI, Pydantic v2, Pandas, SQLite 3
- **State & Storage:** Normalized relational schemas, browser persistence with reactive store

---

## 4. Repository Structure

```
├── .env.example                     # Environment configuration template
├── backend/                         # Python FastAPI Backend Deliverable
│   ├── app.py                       # FastAPI application & endpoints
│   ├── database.py                  # Normalized SQLite schema
│   ├── requirements.txt             # Python backend dependencies
│   └── test_app.py                  # Automated Pytest suite
├── index.html                       # Application HTML entry point
├── metadata.json                    # AI Studio applet metadata
├── package.json                     # Frontend scripts & dependencies
├── src/
│   ├── __tests__/                   # Automated Vitest test suite
│   │   └── annotation.test.ts
│   ├── components/
│   │   ├── AuditTrailView.tsx       # Immutable historical ledger
│   │   ├── Dashboard.tsx            # KPI cards & Recharts graphs
│   │   ├── DatasetManager.tsx       # File upload, validator & sample downloads
│   │   ├── EvaluationView.tsx       # Confusion matrix & F1 metrics
│   │   ├── ExportCenter.tsx         # CSV / JSON exporter & schema preview
│   │   ├── GuidelinesView.tsx       # Annotation rulebook & comparison cards
│   │   ├── Header.tsx               # Top dataset switcher & search
│   │   ├── ImageAnnotator.tsx       # Vision workspace & Bounding Boxes
│   │   ├── QualityAssurance.tsx     # QA rule auditor & review queue
│   │   ├── SettingsModal.tsx        # Annotator ID & preferences
│   │   ├── ShortcutsModal.tsx       # Keyboard cheat-sheet
│   │   ├── Sidebar.tsx              # Dark navy navigation
│   │   └── TextAnnotator.tsx        # Text labeling workbench
│   ├── data/
│   │   ├── guidelinesData.ts        # Comprehensive annotation rulebook
│   │   └── sampleDatasets.ts        # 100 text records + 20 image benchmark
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   ├── utils/
│   │   ├── metrics.ts               # Precision, Recall, F1 & Confusion Matrix
│   │   ├── qaEngine.ts              # Automated rule inspection engine
│   │   └── storage.ts               # Local persistence & CSV/JSON parser
│   ├── App.tsx                      # Root application component
│   ├── index.css                    # Global Tailwind styling
│   └── main.tsx                     # React DOM entry point
└── tsconfig.json
```

---

## 5. Sample Dataset Description

The application includes two preloaded benchmark datasets:
1. **Codefeast NLP Benchmark (100 Records):**
   - Diverse coverage across Technology, Education, Healthcare, Finance, and Entertainment.
   - Includes intentional edge cases:
     - Duplicate record ID (`TX-012`)
     - Missing text payload (`TX-016`)
     - Contradictory labels (`TX-027`: marked Positive with grievance text)
     - Ambiguous sarcasm/irony (`TX-004`, `TX-047`, `TX-059`)
     - Incomplete annotations (`TX-077`)
     - 30 paired ground-truth reference labels for gold-standard evaluation.
2. **Codefeast Vision Benchmark (20 Records):**
   - High-resolution workplace, technology, urban, and nature imagery with pre-annotated bounding boxes.
   - Low-resolution and motion-blurred intentional edge cases (`IMG-008`).

---

## 6. How to Run Locally

### Frontend (React + Vite)
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Open in browser at http://localhost:3000
```

### Running Frontend Tests (Vitest)
```bash
npm test
```

### Backend (Python FastAPI)
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Start FastAPI server with Uvicorn
uvicorn app:app --reload --port 8000

# 5. Run Pytest suite
pytest test_app.py
```

---

## 7. Deployment Instructions

### Frontend (Vercel)
1. Push the repository to GitHub.
2. Connect repository in [Vercel](https://vercel.com).
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Environment: **Python 3**.
3. Build Command: `pip install -r backend/requirements.txt`.
4. Start Command: `uvicorn backend.app:app --host 0.0.0.0 --port $PORT`.

---

## 8. Keyboard Shortcuts Guide

| Key | Action |
|:---:|:---|
| `1` | Select Positive Sentiment |
| `2` | Select Negative Sentiment |
| `3` | Select Neutral Sentiment |
| `4` | Select Unclear Sentiment |
| `Q` | Select Technology Topic |
| `W` | Select Education Topic |
| `E` | Select Healthcare Topic |
| `R` | Select Finance Topic |
| `T` | Select Entertainment Topic |
| `Y` | Select Other Topic |
| `S` | Save Annotation & Auto-Advance |
| `A` | Toggle Ambiguous / Edge Case Flag |
| `N` | Navigate to Next Record |
| `P` | Navigate to Previous Record |
| `G` | Open / Close Embedded Guidelines Drawer |
| `?` | Open Keyboard Shortcuts Cheat-Sheet |

---

## 9. Known Limitations & Future Improvements

- **Current Limitation:** Bounding boxes support rectangular geometry.
  - *Future Roadmap:* Add polygonal segmentation masks and keypoint annotation.
- **Current Limitation:** Local client-side SQLite/JSON storage for single-user review.
  - *Future Roadmap:* Multi-tenant PostgreSQL synchronization with real-time WebSocket collaborative annotation locking.
