from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.planner_router import router as planner_router
from app.routers.detection_router import router as detection_router
from app.routers.ocr_router import router as ocr_router
from app.routers.scene_router import router as scene_router
from app.routers.speech_router import router as speech_router
from app.routers.assistant_router import router as assistant_router
from app.routers.tts_router import router as tts_router
from app.routers.stream_router import router as stream_router
from app.routers.navigation_router import router as navigation_router
from app.routers.emergency_router import router as emergency_router

app = FastAPI(
    title="Vizhi AI",
    description="AI Accessibility Companion for Visually Impaired Users",
    version="2.0"
)

# CORS Configuration for Flutter app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Flutter app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(planner_router)
app.include_router(detection_router)
app.include_router(ocr_router)
app.include_router(scene_router)
app.include_router(speech_router)
app.include_router(assistant_router)
app.include_router(tts_router)
app.include_router(stream_router)
app.include_router(navigation_router)
app.include_router(emergency_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to Vizhi AI 🚀",
        "version": "2.0",
        "features": [
            "Object Detection",
            "OCR (Text Reading)",
            "Scene Description",
            "Speech-to-Text (Whisper)",
            "Text-to-Speech (Edge TTS)",
            "Live Camera Monitoring",
            "Safety Agent",
            "Navigation",
            "Emergency SOS"
        ]
    }

@app.get("/health")
def health():
    return {"status": "running", "service": "Vizhi AI Backend"}