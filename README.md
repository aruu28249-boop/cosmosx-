# CosmosX

> **Explore the Past. Visualize the Present. Simulate the Future — an immersive 3D space exploration platform powered by real orbital mechanics, AI scenario analysis, and live space news.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%203D-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.1-F55036?style=flat-square)](https://groq.com)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square&logo=opensourceinitiative&logoColor=white)](LICENSE)

---

## Preview

```
                                                                                
  ██████╗ ██████╗ ███████╗███╗   ███╗ ██████╗ ███████╗██╗  ██╗
 ██╔════╝██╔═══██╗██╔════╝████╗ ████║██╔═══██╗██╔════╝╚██╗██╔╝
 ██║     ██║   ██║███████╗██╔████╔██║██║   ██║███████╗ ╚███╔╝ 
 ██║     ██║   ██║╚════██║██║╚██╔╝██║██║   ██║╚════██║ ██╔██╗ 
 ╚██████╗╚██████╔╝███████║██║ ╚═╝ ██║╚██████╔╝███████║██╔╝ ██╗
  ╚═════╝ ╚═════╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
                                                                                
        EXPLORE THE PAST  ·  VISUALIZE THE PRESENT  ·  SIMULATE THE FUTURE        
```

![CosmosX Home](assets/home.png)
*Hero landing page — full-bleed Earth + galaxy backdrop with the COSMOSX wordmark*

![CosmosX Simulator](assets/simulator.png)
*Default simulator view — real-time 3D solar system with all 8 planets in accurate orbital positions*

![AI Analysis Panel](assets/simulator-ai.png)
*Asteroid Strikes scenario — Groq AI breakdown rendered live in the right panel alongside the 3D impact*

![TIME floating text](assets/simulator-time.png)
*10× Speed selected — animated floating description with the "LEARN MORE ›" deep-dive trigger*

![Space News](assets/news.png)
*Space News feed — latest articles from SpaceflightNewsAPI with year filter (2011–Latest)*

---

## What It Does

CosmosX is a full-stack Next.js 15 web app that turns space exploration into an interactive experience. A live 3D solar system greets you on arrival, rendered with 6,000+ stars and real Keplerian orbital dynamics. From there you can step through the history of space exploration, browse live mission news, simulate "what if" cosmic scenarios with an AI engine, and discover your cosmic crew role — all without leaving the browser.

The AI scenario engine uses **Groq (LLaMA 3.1-8b-instant)** to analyze user-defined hypotheticals and returns structured scientific breakdowns. Text-to-speech narration is optionally powered by **Deepgram** so every analysis can be read aloud. Space news is pulled in real time from the public **SpaceflightNewsAPI** — no API key required.

---

## Features

### 3D Solar System

A real-time WebGL universe built with Three.js and React Three Fiber. Six thousand stars twinkle in the background while all eight planets trace accurate elliptical orbits. The home page hero runs an animated solar system on a looping video backdrop — GPU instancing keeps it smooth even on mid-range hardware.

### AI Scenario Simulator

Type any "what if" about the cosmos — *What if Jupiter disappeared? What if Earth had two moons? What if the Sun were twice as massive?* — and the Groq-powered engine returns a structured breakdown: scientific explanation, physical impacts, a cascading timeline of effects, and a survivability rating. Three pre-built scenarios let you jump in immediately. Optional Deepgram text-to-speech narrates the full analysis on demand.

### Cosmic Timeline

An interactive chronological record of humanity's greatest space milestones — from Sputnik (1957) through Apollo 11, Voyager, Hubble, the ISS, James Webb, Chandrayaan-3, and a projected Mars colony (2050). Each entry expands to show mission facts and a full description in an alternating left-right layout.

### Live Space News

Aggregated articles from SpaceflightNewsAPI in an animated card grid. Filter by year from 2010 through the latest — every card shows the headline, summary, image, and a direct link to the source.

### Crew Registry & Role-Finder Quiz

Four fictional crew members with detailed dossiers, security clearances, and sci-fi bios. A 3-question role-finder quiz — drawing on live Earth–Mars and Earth–Jupiter distance data calculated from real orbital elements — assigns you one of three roles: **Quantum Propulsion Engineer**, **Deep Space Cartographer**, or **Astrobiologist**.

### Dark Pattern Detection

| Role | What it means |
|---|---|
| **Quantum Propulsion Engineer** | You think in systems and love pushing boundaries |
| **Deep Space Cartographer** | You chart the unknown and thrive on discovery |
| **Astrobiologist** | You search for life and ask the biggest questions |

### Contact / Sub-Space Transmission

A sci-fi themed contact form that animates an "uplink" progress bar on submission and responds with mission-control flavor text.

---

## Quick Start

**Prerequisites:** Node.js 18+ · A free Groq API key (for the simulator) · Optional Deepgram key (for narration)

### 1. Clone

```bash
git clone (https://github.com/aruu28249-boop/cosmosx-.git)
cd cosmosx-
```

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
GROQ_API_KEY=gsk_...your_key_here
DEEPGRAM_API_KEY=...your_key_here   # optional — narration only
```

Get a free Groq key at [console.groq.com/keys](https://console.groq.com/keys) — the free tier is more than enough for personal use. Space news works without any key (public API).

Without a Groq key, the simulator still plays 3D visuals but the AI analysis panel shows a "not configured" message.

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Why CosmosX?

Most space apps give you static images and Wikipedia paragraphs. CosmosX is the only platform that combines a real-time 3D universe, AI-powered "what if" simulation, live mission news, and real orbital mechanics — all in a single browser tab, for free.

| Feature | CosmosX | NASA Eyes on the Solar System | SpaceEngine | Universe Sandbox | Star Walk 2 |
|---|:---:|:---:|:---:|:---:|:---:|
| Runs in the browser | ✅ | ✅ | ❌ Desktop only | ❌ Desktop only | ❌ Mobile only |
| Real-time 3D solar system | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI "what if" scenario engine | ✅ | ❌ | ❌ | ❌ | ❌ |
| Text-to-speech narration | ✅ | ❌ | ❌ | ❌ | ❌ |
| Live space news feed | ✅ | ❌ | ❌ | ❌ | ❌ |
| Historical mission timeline | ✅ | ✅ | ❌ | ❌ | ❌ |
| Real Keplerian orbital mechanics | ✅ | ✅ | ✅ | ✅ | ❌ |
| Role-finder quiz | ✅ | ❌ | ❌ | ❌ | ❌ |
| Free & open source | ✅ | ✅ | ❌ Paid | ❌ Paid | ❌ Paid |
| No install required | ✅ | ✅ | ❌ | ❌ | ❌ |

The key gap CosmosX fills: **interactive AI reasoning about space**. No existing tool lets you ask "what if the asteroid belt disappeared?" and get a structured scientific analysis with a survivability rating in seconds. That's the core bet — curiosity-driven exploration, not just passive observation.

---

## Tech Stack

| | Purpose |
|---|---|
| [![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org) | Full-stack React framework (App Router) |
| [![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev) | UI library |
| [![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org) | WebGL 3D rendering engine |
| [![R3F](https://img.shields.io/badge/@react--three/fiber-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://r3f.docs.pmnd.rs) | React renderer for Three.js |
| [![Drei](https://img.shields.io/badge/@react--three/drei-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://github.com/pmndrs/drei) | Reusable 3D helpers & abstractions |
| [![Groq](https://img.shields.io/badge/Groq%20AI-LLaMA%203.1-F55036?style=flat-square)](https://groq.com) | AI scenario analysis & quiz generation |
| [![Deepgram](https://img.shields.io/badge/Deepgram-TTS-101010?style=flat-square)](https://deepgram.com) | Text-to-speech narration (optional) |
| [![Tailwind](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com) | Utility-first styling |
| [![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/) | Page & component animations |
| [![Lucide](https://img.shields.io/badge/Lucide%20Icons-F56565?style=flat-square)](https://lucide.dev) | UI icons |
| [![Vercel Analytics](https://img.shields.io/badge/Vercel%20Analytics-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/analytics) | Usage analytics |

---

## Orbital Mechanics

Live planetary distances shown in the quiz are not hardcoded. `lib/orbital-mechanics.js` computes each planet's current ecliptic longitude using the **J2000.0 epoch** and mean orbital elements (semi-major axis, eccentricity, mean anomaly, inclination), then derives the Earth–planet distance in AU via the law of cosines. The result updates on every quiz load.

---

## Deploy to Vercel

CosmosX is a Next.js 15 app — Vercel deploys it in one step with zero config.

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import your repo
2. Vercel auto-detects Next.js — no build configuration needed
3. Add environment variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `DEEPGRAM_API_KEY` | Your Deepgram API key (optional) |

4. Click **Deploy** — live in ~60 seconds

> The Vercel free tier handles CosmosX comfortably. The Groq free tier supports thousands of scenario analyses per day.

---

## Roadmap

### Shipped

- [x] Real-time 3D solar system with accurate Keplerian orbital mechanics
- [x] AI "what if" scenario engine (Groq / LLaMA 3.1) with structured analysis
- [x] Time controls — pause, 1×, 10×, 100× speed with per-mode deep-dive modals
- [x] Time Machine — jump to any date and watch planets reposition in real time
- [x] Planet surface explorer — click any planet to orbit it up close
- [x] Live space news feed with year filter (2011 – Latest)
- [x] Historical mission timeline (Sputnik 1957 → Mars colony 2050)
- [x] Crew registry, dossiers, and role-finder quiz with live orbital data
- [x] Text-to-speech narration for AI scenario analysis (Deepgram)
- [x] Shooting stars, asteroid belt, rogue planet, and scenario visual effects

### In Progress / Near-term

- [ ] Shareable scenario cards — export AI analysis as a styled PNG
- [ ] Voice input for scenario prompts (Web Speech API)
- [ ] Mobile-optimised 3D with adaptive quality based on device GPU tier
- [ ] Webb telescope image gallery with NASA APOD integration

### Future

- [ ] **Timeline deep-dive** — expand each mission with crew bios, launch video, instrument breakdowns, and an interactive mission-path overlay on the solar system
- [ ] **Gamified simulator** — score points for predicting scenario outcomes, unlock harder "what ifs", leaderboard across users
- [ ] **Planet surface mode** — actual textured terrain to walk across: craters, canyons, atmosphere layers, day/night cycle per planet
- [ ] **Beyond the solar system** — zoom out to the Milky Way, visit nearby star systems, explore nebulae and black holes
- [ ] **Sandbox / God mode** — freeform universe editor: spawn aliens, ice comets, meteor showers, rogue stars, custom planets; run collisions, chain reactions, and watch the physics play out
- [ ] Exoplanet explorer — filter Kepler/TESS discoveries by habitability zone
- [ ] Multiplayer crew mode — share a quiz or sandbox session with friends in real time

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- AI analysis by [Groq](https://groq.com) running [LLaMA 3.1](https://llama.meta.com/) (llama-3.1-8b-instant)
- Text-to-speech by [Deepgram](https://deepgram.com) (aura-2-pluto-en)
- Space news from [SpaceflightNewsAPI](https://api.spaceflightnewsapi.net)
- 3D powered by [Three.js](https://threejs.org), [React Three Fiber](https://r3f.docs.pmnd.rs), and [Drei](https://github.com/pmndrs/drei)
- Icons by [Lucide](https://lucide.dev)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Fonts: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond), [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
