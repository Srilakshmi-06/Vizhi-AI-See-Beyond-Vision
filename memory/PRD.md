# Vizhi AI - Product Requirements Document

## Original Problem Statement
Build **Vizhi AI**, a production-ready multi-agent accessibility application for visually impaired users. Extend an existing FastAPI + Flutter project feature-by-feature without breaking existing architecture. Transform the web dashboard into a voice-first, accessibility-focused product suitable for a national-level hackathon demonstration.

## Architecture
- **Backend:** FastAPI on port 8001 (Python) — 10 API routers, 5 AI models
- **Frontend Dashboard:** Node.js/Express static server on port 3000 (serves index.html, style.css, app.js)
- **Mobile Client:** Flutter (external, not in this repo)
- **AI Stack:** YOLOv8, EasyOCR, Faster Whisper, Ollama (Llama 3.2), Edge TTS
- **Storage:** File-based (uploads/, audio_outputs/), SQLite planned

## User Personas
1. **Visually Impaired End User** - Uses Flutter mobile app for hands-free accessibility
2. **Developer / Integrator** - Uses web dashboard for testing all API endpoints
3. **Hackathon Judge / Stakeholder** - Sees full system capabilities on Live Mode dashboard

## Core Requirements (Static)
1. Continuous camera monitoring with obstacle warnings (500-1000ms frame rate)
2. Voice-to-voice interaction (STT → AI processing → TTS)
3. Smart safety warnings (no repetition, priority-based)
4. Text reading (OCR) for signs, labels, menus
5. Scene description in natural language
6. Emergency SOS system
7. Navigation assistance with obstacle awareness
8. **Accessibility-first UI**: large targets (52px+), high contrast (WCAG AAA), clear focus rings, screen-reader announcements

## What's Been Implemented

### Session 1 (Backend)
- Edge TTS service, Safety Agent, Live Stream endpoint
- Enhanced Voice Assistant, Navigation, Emergency SOS routers
- All routes under `/api/*`, CORS enabled

### Session 2 (Dashboard v1 - Modern SPA)
- 11-page dashboard with tabbed navigation, dark theme
- Live camera streaming, voice recording, TTS playback
- API health monitoring, toast notifications

### Session 3 (Accessibility Redesign — CURRENT)
- **Live Mode is now the star dashboard**: 70% camera + right column (Voice + AI Status) + detection/scene cards + quick action bar
- **Object Detection with Risk Classification**:
  - HIGH (red): car, truck, bus, motorcycle, bicycle, stairs, pole, fire hydrant, traffic light, stop sign, knife
  - MEDIUM (amber): person, chair, couch, dining table, bench, dog, cat, door
  - LOW (green): bottle, book, backpack, cup, laptop, keyboard
  - Cards sorted by risk priority, colored borders + icons + risk tags
- **Voice Assistant Orb** with 4 states: idle / listening (red pulse) / processing (blue spin) / speaking (green breathe)
- **AI Status Panel** with per-service dots (green/yellow/red) — polls planner endpoint every 45s
- **Camera states** properly managed: idle (with "Start Camera" prompt), loading spinner, error state with retry, ready with HUD overlay
- **Quick Action Bar**: Read Text / Describe / Navigate / Emergency SOS — large 88px+ buttons
- **Live warning banner** overlaid on camera feed for immediate visual + audio warnings
- **Collapsible sidebar** with icons + labels + grouped sections
- **Voice suggestions chips** for common commands
- **Scene description card** auto-refreshes every 20s during monitoring
- **Skip-to-content link** for screen readers
- **`aria-live` regions** for warnings, toasts, and status
- **Focus rings** (3px yellow) for keyboard navigation
- **Base font 18px**, line-height 1.55, min button height 52px (large touch targets)
- **Reduced-motion support** for users with vestibular disorders
- **Responsive breakpoints**: 1280px / 1100px / 768px / 480px

### Infrastructure
- Supervisor running backend + frontend
- Backend hot-reload enabled
- Static assets served by Node.js/Express (port 3000)
- API served by FastAPI (port 8001)
- All API calls routed via Kubernetes ingress
- TTS sync wrapper uses ThreadPoolExecutor for calls from async endpoints

## What's NOT Yet Implemented
- **Ollama** not installed in preview container → Planner & Scene Description show "DEGRADED"
- **Real navigation API** (Google Maps / Mapbox)
- **Real emergency contact system** (Twilio SMS/calls)
- **User authentication** (JWT or Emergent Google Auth)
- **GPS location tracking**
- **Offline mode**
- **Multi-language STT/TTS**
- **Distance estimation** for detected objects (placeholder shown)
- **Bounding box overlays** on live camera feed

## Prioritized Backlog

### P0 (Full Vision Needs Ollama)
- [ ] Install Ollama + `ollama pull llama3.2:3b` for Planner Agent + Scene Description

### P1 (High Priority Enhancements)
- [ ] Distance estimation (MonoDepth model or bounding box heuristics)
- [ ] Bounding box overlays on live camera canvas
- [ ] Google Maps / Mapbox integration for real navigation
- [ ] Twilio for emergency SMS/call
- [ ] User authentication (JWT or Emergent Google Auth)
- [ ] GPS location tracking

### P2 (Polish)
- [ ] Multi-language support (STT + TTS + LLM prompts)
- [ ] Offline mode with cached models
- [ ] Guardian mapping (share location with trusted contact)
- [ ] Conversation history persistence
- [ ] AI Memory (personalization)
- [ ] Voice-command settings page
- [ ] Battery optimization (adaptive frame rate)

## Files Structure
```
/app/
├── backend/
│   ├── server.py, requirements.txt, yolov8n.pt
│   ├── app/
│   │   ├── main.py (FastAPI + CORS + 10 routers)
│   │   ├── routers/ (planner, detection, ocr, scene, speech, tts, stream, assistant, navigation, emergency)
│   │   ├── services/ (vision, speech, safety, planner, assistant, navigation, emergency, llm)
│   │   ├── models/, utils/
│   ├── uploads/, audio_outputs/
│
├── frontend/
│   ├── package.json, server.js (Express port 3000)
│   ├── public/
│   │   ├── index.html    ← Live Mode dashboard + 10 tabs
│   │   ├── style.css     ← Accessibility-first design tokens
│   │   └── app.js        ← Voice states, risk classification, AI polling
│
├── memory/PRD.md (this file)
├── API_DOCUMENTATION.md, IMPLEMENTATION_SUMMARY.md, OLLAMA_SETUP.md, README.md
└── test_system.sh
```

## API Endpoints Summary
All backend endpoints under `/api/*` prefix:
- Core: `/api/stream/analyze` (live camera), `/api/assistant/` (voice unified)
- Vision: `/api/detect/`, `/api/ocr/`, `/api/scene/`
- Voice: `/api/speech/`, `/api/tts/`, `/api/tts/voices`
- AI: `/api/planner/`
- Assist: `/api/navigation/navigate`, `/api/navigation/direction`
- Safety: `/api/emergency/trigger`, `/api/emergency/cancel`
- Audio serving: `/api/assistant/audio/{filename}`
- Health: `/health`, `/api/emergency/health`, `/api/stream/health`

## Next Tasks
1. Install Ollama in the preview environment for full Planner + Scene functionality
2. Add bounding box overlays on live camera canvas
3. Integrate with Flutter mobile app using the browser dashboard as reference
4. Add JWT authentication before production deployment
