from fastapi import FastAPI
from app.routers.planner_router import router as planner_router
from app.routers.detection_router import router as detection_router
from app.routers.ocr_router import router as ocr_router

app = FastAPI(
    title="Vizhi AI",
    description="AI Accessibility Companion",
    version="1.0"
)

app.include_router(planner_router)
app.include_router(detection_router)
app.include_router(ocr_router)

@app.get("/")
def home():
    return {"message": "Welcome to Vizhi AI 🚀"}

@app.get("/health")
def health():
    return {"status": "running"}