# 🌿 Eco Slate — Carbon Ledger & Sandbox Platform

> A high-fidelity carbon emissions tracking journal designed with a mindful **Wabi-Sabi Ethos**, prioritizing quiet, tactile interfaces, high typographic contrast, and robust client-side storage diagnostics.

---

## 🎨 Visual Philosophy & Aesthetic Instinct
Eco Slate rejects generic high-contrast fluorescent styling in favor of organic physical qualities:
* **Tactile Paper Surfaces**: Off-white background canvas options with dark charcoal typography, reminiscent of coarse linen paper.
* **Warm Minimalist Palettes**: Utilizing custom accents such as *Clay*, *Earth Muted*, *Emerald Deep*, and *Rose Muted* for high legibility and balanced contrast.
* **Typographic Rhythm**: Pairings of classic, elegant editorial serif headings (*Source Serif 4* and *Playfair Display*) with technical, dense data overlays (*JetBrains Mono*).

---

## 🏗️ Architecture & Core Domains

### 1. Personal Accountability Slate (Journal Domain)
The daily ledger to monitor carbon-emitting actions and positive offsets:
* **Intelligent AI Parsing**: Integrate dictated log phrases via voice speech with a custom Express-mediated proxy communicating with the Google **Gemini 3.5 Flash** model. Dictate or write normal human items like *"I took the rail line for 35 kilometers after eating a vegan rice bowl"* and watch it categorize and log.
* **Device Energy Drawing**: Configure domestic appliances with load draws (Watts) and active hourly periods to build continuous power footprints.
* **Verified Offsets Registry**: Monitor local restoration actions against real reforestation or solar recovery projects with physical USD weights.

### 2. Macro Atmospheric Insights (Insights Domain)
Translates local habits into long-term systemic trajectories:
* **Composed Multi-Axis Visualization**: Track direct carbon emissions, aggregate project offsets, and predictive 3-month linear forecast trajectories using dynamic vector charts (`recharts`).
* **Statistical Anomaly Delineations**: Dynamic threshold calculations rendering horizontal alert boundaries. Highlighting anomalies where forecasts significantly exceed baseline standard deviations.

### 3. Actionable Shift Wisdom (Strategy Domain)
Strategic models that translate daily footprint values into real-world behavior changes:
* **A-B Substitution Simulator**: Interactively switch parameters to see direct reductions (e.g. trading an Internal Combustion Engine ride for high-speed rail commuter routes).
* **Discourse Forum**: Synchronizes physical user reflections alongside existing historic carbon wisdom.

---

## 🧩 Sandbox Diagnostics Engine
Designed explicitly for modern private spaces (Private browser windows/Incognito tabs) and unstable environments:
* **Connection Dropout Sandbox**: Trigger simulated network decoupling to test calculation engine autonomy when disconnected.
* **Safe Memory Cache Fallback**: Detects sandboxed, disabled, or blocked browser storage protocols (like disabled `localStorage` under strict incognito permissions) and dynamically hot-swaps to zero-overhead in-memory buffers so the application never crashes.
* **JSON Ledger Migrator**: High-fidelity backup options allowing users to export full database arrays into structured JSON files, or import previous registries directly.

---

## ⚡ Technical Foundations

### Core Stack
* **Runtime / Framework**: React 19 + TypeScript + Vite
* **Backend Pipeline**: Node.js + Express proxying model requests safely
* **Style Engine**: Tailwind CSS v4.0 (pure utility classes, native CSS compilation)
* **Animation Orchestrator**: `motion` (fade, drawer springs, state changes)
* **Testing Registry**: `vitest`

---

## 🛡️ Pillars of Engineering Quality

### 1. Accessibility (WCAG compliant)
* High contrast ratio colors designed for both Light & Dark variants preventing visual strain.
* Intuitive 44px minimum touch target regions with fluid responsive layouts preserving mobile rendering.
* Semantic labels on interactive components.

### 2. Efficiency
* **Lazy Initialization**: Gemini API SDK initialized only on requested routes, saving startup times and overhead on boot.
* **HMR-Free Optimization**: Completely decoupled event hooks and stable dependency chains preventing state stutter or infinite loop cycles.

### 3. Security
* **Zero API exposing**: All API secret keys are securely guarded within server environment states. Standard client queries are routed through a secure backend proxy `/api/gemini/parse-log`, keeping variables hidden from inspector consoles.
* **State Isolation**: User ledger entries have client-confined scopes for offline isolation.

---

## 🧪 Testing Suite
A comprehensive unit testing pipeline covering mathematical accuracy, fallback safety, and incognito safety:

* **Calculation Factors**: Tests exact carbon output ratios based on IPCC and EPA grid models.
* **Graceful Fallbacks**: Ensures incorrect user entries/unmatched categories default to clean, predicted median indices instead of failing.
* **Incognito Sandbox Assertions**: Tests state sandbox behaviors when disk operations are forcefully blocked.

```bash
# Run tests inside the execution container
npm run test
```

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Credentials
Create a `.env` file or export your system environments:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### 3. Star Dev Server
```bash
npm run dev
```
The node environment will bind to `http://localhost:3000`.

### 4. Build & Production Start
```bash
# Build Vite production assets & bundle server.ts via esbuild
npm run build

# Start production server
npm run start
```
