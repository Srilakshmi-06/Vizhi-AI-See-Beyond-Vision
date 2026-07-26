# Vizhi AI - Product Requirements Document

## Original Problem Statement
Build **Vizhi AI**, a production-ready multi-agent accessibility application for visually impaired users. Extend an existing FastAPI + Flutter project feature-by-feature without breaking existing architecture.

## Architecture
- **Backend:** FastAPI on port 8001 (Python)
- **Frontend Dashboard:** Node.js/Express static server on port 3000 (serves HTML/CSS/JS)
- **Mobile Client:** Flutter (external, not in this repo)
- **AI Stack:** YOLOv8, EasyOCR, Faster Whisper, Ollama (Llama 3.2), Edge TTS
- **Storage:** File-based (uploads/, audio_outputs/), SQLite planned

## User Personas
1. **Visually Impaired End User** - Uses Flutter mobile app for hands-free accessibility
2. **Developer / Integrator** - Uses web dashboard for testing all API endpoints
3. **Stakeholder / Demo Viewer** - Uses dashboard to see the system in action

## Core Requirements (Static)
1. Continuous camera monitoring with obstacle warnings (500-1000ms frame rate)
2. Voice-to-voice interaction (STT → AI processing → TTS)
3. Smart safety warnings (no repetition, priority-based)
4. Text reading (OCR) for signs, labels, menus
5. Scene description in natural language
6. Emergency SOS system
7. Navigation assistance with obstacle awareness

## What's Been Implemented (Session 1 - July 2025)

### Backend Features ✅
- **Edge TTS Service** - Async/sync text-to-speech with 100+ voices
- **Safety Agent** - Smart obstacle warnings with 3-tier priority (high/medium/low), 5-second cooldown, position tracking
- **Live Camera Stream** - `POST /api/stream/analyze` for continuous frame analysis
- **Enhanced Voice Assistant** - Full voice-to-voice flow with all agents
- **Navigation Service** - Direction guidance + destination navigation
- **Emergency SOS** - Alert triggering with unique IDs
- **All routers updated** with `/api` prefix (Kubernetes-ready)
- **CORS enabled** for cross-origin requests

### Frontend Dashboard ✅ (Session 2 - Just Completed)
- **Modern SPA Dashboard** built with vanilla HTML/CSS/JS (Space Grotesk font, dark theme)
- **11 Feature Pages:**
  - Dashboard (hero + stats + feature grid)
  - Live Camera (real-time monitoring with browser camera API)
  - Object Detection (drag-and-drop upload)
  - OCR (text reading with audio playback)
  - Scene Description (AI descriptions)
  - Voice Assistant (mic recording + conversation UI)
  - Speech to Text (audio upload)
  - Text to Speech (with 8 preset voices)
  - Navigation (destination + direction pad)
  - Emergency SOS (large trigger button)
  - API Reference (all endpoints listed)
- **Real-time features:**
  - Live camera stream analysis (browser → backend every 800ms)
  - Voice recording via MediaRecorder API
  - Auto-play audio responses
  - System health monitoring (30s interval)
  - Toast notifications
- **Deployable via Express.js** on port 3000
- **Data-testid attributes** on all interactive elements

### Infrastructure ✅
- Supervisor running both backend + frontend
- Backend hot-reload enabled
- Static assets served by Node.js/Express (port 3000)
- API served by FastAPI (port 8001)
- All API calls routed via Kubernetes ingress

## What's NOT Yet Implemented
- **Ollama** not installed in preview container (Planner agent + Scene Description need it)
- **Real navigation API** (Google Maps / Mapbox integration)
- **Real emergency contact system** (Twilio SMS / calls)
- **User authentication** (JWT or Emergent Google Auth)
- **GPS location tracking**
- **Offline mode**
- **Multi-language support**

## Prioritized Backlog

### P0 (Blocking for full functionality)
- [ ] Install/configure Ollama for Planner Agent and Scene Description
- [ ] Add distance estimation to Safety Agent (depth sensing)

### P1 (High priority enhancements)
- [ ] Integrate Google Maps API for real navigation
- [ ] Integrate Twilio for emergency SMS/call
- [ ] Add user authentication (JWT or Emergent Google Auth)
- [ ] GPS location tracking

### P2 (Nice-to-have)
- [ ] Multi-language support (STT + TTS + LLM)
- [ ] Offline mode with cached models
- [ ] Battery optimization (adaptive frame rate)
- [ ] Personalization / route learning
- [ ] Indoor navigation with beacons

## Next Tasks
1. Test all dashboard pages end-to-end (upload real images to detection/OCR)
2. Install Ollama and pull llama3.2:3b for full agent routing
3. Integrate with Flutter mobile app
4. Add authentication for production
5. Deploy to production infrastructure

## Files Structure
```
/app/
├── backend/
│   ├── server.py              # FastAPI entry point
│   ├── requirements.txt       # Python dependencies (frozen)
│   ├── yolov8n.pt            # YOLO model (~50MB)
│   ├── app/
│   │   ├── main.py           # FastAPI app + CORS + routers
│   │   ├── routers/          # 10 API route modules
│   │   ├── services/         # Business logic
│   │   │   ├── vision/       # YOLO, EasyOCR, Scene
│   │   │   ├── speech/       # Whisper (STT), Edge TTS
│   │   │   ├── safety/       # Safety Agent (NEW)
│   │   │   ├── planner/      # Query routing
│   │   │   ├── assistant/    # Orchestration
│   │   │   ├── navigation/   # Directions
│   │   │   ├── emergency/    # SOS
│   │   │   └── llm/          # Ollama integration
│   │   ├── models/           # Pydantic models
│   │   └── utils/            # Helpers
│   ├── uploads/              # Temp image storage
│   └── audio_outputs/        # Generated audio files
│
├── frontend/
│   ├── package.json          # Express dependency
│   ├── server.js             # Static file server (port 3000)
│   ├── node_modules/
│   └── public/
│       ├── index.html        # Dashboard SPA
│       ├── style.css         # Modern dark theme
│       └── app.js            # All feature logic
│
├── memory/
│   └── PRD.md                # This file
│
├── API_DOCUMENTATION.md       # Full API reference
├── IMPLEMENTATION_SUMMARY.md  # Technical details
├── OLLAMA_SETUP.md           # Ollama installation guide
├── README.md                 # Project overview
└── test_system.sh            # Automated test script
```

## API Endpoints Summary
- `GET /` - Backend API info
- `GET /health` - Backend health check
- `GET /docs` - Swagger UI
- `POST /api/stream/analyze` - Live camera frame analysis (Core)
- `POST /api/assistant/` - Voice assistant unified endpoint (Core)
- `POST /api/detect/` - Object detection
- `POST /api/ocr/` - Text reading
- `POST /api/scene/` - Scene description
- `POST /api/speech/` - Speech to text
- `POST /api/tts/` - Text to speech
- `GET /api/tts/voices` - List available voices
- `POST /api/planner/` - Agent routing
- `POST /api/navigation/navigate` - Get directions
- `POST /api/navigation/direction` - Directional guidance
- `POST /api/emergency/trigger` - SOS alert
- `POST /api/emergency/cancel` - Cancel SOS
- `GET /api/assistant/audio/{filename}` - Retrieve generated audio

## Testing
Run `bash /app/test_system.sh` for automated tests.
Access dashboard at the public preview URL for interactive testing.
