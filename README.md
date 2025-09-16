## Dynamic Multi‑Window Experience (Core Nexus)

An interactive, browser‑based visualization that spans two separate windows. Each window renders a glowing "core" with flowing particle filaments. As the two browser windows move closer on your screen, they interact: particles stream between them, energy arcs appear, and when overlapped the cores visually merge. The two windows communicate in real time via BroadcastChannel, creating a seamless, multi‑window experience with no backend.

---

## Features

- Two synchronized browser windows linked via BroadcastChannel
- Real‑time inter‑window particle streaming (with seamless handoff at window boundaries)
- Hi‑DPI aware Canvas rendering and parallax starfield/nebula background
- Dynamic core with animated rings, glow, and energy arcs between windows
- "Merged" visual state when windows overlap; focus determines top/bottom layer
- Resilient UX: auto‑opens the partner window; shows a manual button if pop‑ups are blocked
- Pure front‑end: no build process, no server required (though a local server is recommended)

---

## Technology Stack

- HTML5, CSS (Tailwind via CDN), Google Fonts (Inter)
- JavaScript (ES Modules)
- Canvas 2D API for all rendering
- BroadcastChannel API for inter‑window messaging
- No external runtime dependencies or package manager

---

## Project Structure

- `nexus_one.html` — Entry point for "Core Nexus 1" window; sets up canvas, animation loop, communication, and auto‑launch of Nexus 2.
- `nexus_two.html` — Entry point for "Core Nexus 2" window; mirrors Nexus 1 and auto‑launches Nexus 1 when opened standalone.
- `nexus_shared.js` — Shared ES module with rendering and logic primitives:
  - Canvas scaling (`resizeCanvasHiDPI`), window client‑area detection (`getClientAreaPosition`)
  - Background rendering (`drawBackgroundShared`) with stars and nebulae
  - Core rendering (`drawCore`) with animated rings and bloom
  - Particle class and update/draw logic
  - Inter‑window particle transfer helpers (`updateParticleListShared`)
  - Overlays and arcs (`drawPartnerCoreOverlay`, `drawMergeArcs`)
- `favicon.ico` — Site icon used by the HTML pages.

There is no package.json or build tooling; the app runs directly in a modern browser.

---

## Installation and Setup

### Prerequisites
- A modern desktop browser that supports ES Modules and BroadcastChannel:
  - Chrome, Edge, Firefox, or Safari (recent versions)
- Optional but recommended: a local static server to avoid any file:// quirks

### Get the code
- Clone or download this repository to your machine

### Run locally (choose one)
1) Open directly
- Double‑click `nexus_one.html` to open it in your browser
- It will attempt to open `nexus_two.html` automatically
- If the browser blocks pop‑ups, use the on‑screen "Launch Nexus 2" button

2) Serve with a simple static server (recommended)
- Python 3: `python -m http.server 8000`
  - Then visit http://localhost:8000/nexus_one.html
- Node (using a global/temporary tool): `npx serve .`
  - Then visit the served URL for `nexus_one.html`
- VS Code Live Server or any other static server also works

No dependency installation is required; the pages reference Tailwind and Google Fonts via CDN.

---

## Usage

- Start from `nexus_one.html`. The app will try to open the partner window (`nexus_two.html`). If pop‑ups are blocked, click the on‑screen button to launch it.
- Arrange the two windows on your desktop:
  - Far apart: each shows a stable core with background stars/nebula
  - Within attraction radius: filaments stream toward the partner core; energy arcs appear
  - Overlapping windows: the cores enter a MERGED state; the window in focus is shown as the top layer
- Close either window: the other window returns to "Awaiting Link" and shows the launch button (if needed).

Tips
- Allow pop‑ups for the page for the smoothest experience, or use the manual button
- A larger screen makes it easier to see attraction/filament behavior before merging

---

## Configuration and Tuning

You can tweak visual and behavioral constants to change the experience. Key places:
- `nexus_one.html` / `nexus_two.html`
  - `ATTRACTION_RADIUS`, `MERGE_DISTANCE`, `PARTICLE_COUNT`, `PARTICLE_LIFESPAN`
  - Core/particle colors (`CORE_COLOR`, `PARTICLE_COLOR`, `HOT_PARTICLE_COLOR`, `MERGED_COLOR`)
- `nexus_shared.js`
  - Particle physics and drawing (e.g., wave amplitude/frequency, trail length)
  - Background star density and parallax

---

## How It Works (Architecture Overview)

- Each window renders to a full‑viewport Canvas and shares a `BroadcastChannel` named `portal_nexus_channel`.
- Every animation frame, each window:
  1. Measures its client‑area position on the physical screen (`getClientAreaPosition`) and sends it to the channel
  2. Updates and draws particles toward the partner window’s attractor
  3. Transfers particles that cross into the partner window by posting their state; the partner recreates and continues them seamlessly
  4. Sends "ghost" particles near boundaries to reduce visual gaps at window edges
- Visual states transition based on computed inter‑window distance:
  - Stable → Filaments Active → Merged (when overlapped)
- Canvas rendering is scaled for Hi‑DPI via `resizeCanvasHiDPI` to keep crisp visuals.

---

## Development

- No build step required; edit the HTML/JS files and refresh the browser
- Recommended workflow:
  1. Run a local static server (see above)
  2. Open `nexus_one.html` in a modern browser
  3. Tweak constants in the HTML files or particle/background code in `nexus_shared.js`
  4. Reload the page(s) to see changes
- Code style: vanilla ES Modules, small shared utility module, Tailwind via CDN for quick styling
- Browser devtools: use Performance/Memory/Canvas debugging to profile particle counts or animation cost

---

## License

MIT License

---

## Acknowledgments

- TailwindCSS via CDN for simple UI polish
- Inter font via Google Fonts
- Inspiration from multi‑window UI experiments and particle system visualizations

