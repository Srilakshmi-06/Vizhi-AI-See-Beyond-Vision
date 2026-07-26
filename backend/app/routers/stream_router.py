from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import logging

from app.utils.file_utils import save_uploaded_file
from app.services.vision.detection_service import detect_objects
from app.services.safety.safety_agent import get_safety_agent
from app.services.speech.tts_service import text_to_speech

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/stream",
    tags=["Live Camera Stream"]
)


@router.post("/analyze")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Analyze a single camera frame for safety.
    
    This endpoint should be called every 500-1000ms by the Flutter app
    to provide continuous monitoring.
    
    Args:
        file: Camera frame image
    
    Returns:
        {
            "objects": List of detected objects,
            "warnings": List of warning messages,
            "safe": Boolean indicating if environment is safe,
            "audio_warning": Path to audio warning file (if warnings exist)
        }
    """
    try:
        # Save uploaded frame
        image_path = save_uploaded_file(file)
        
        # Detect objects in frame
        detected_objects = detect_objects(image_path)
        
        # Get safety agent
        safety_agent = get_safety_agent()
        
        # Analyze frame for safety
        safety_analysis = safety_agent.analyze_frame(detected_objects)
        
        response = {
            "objects": detected_objects,
            "warnings": safety_analysis["warnings"],
            "dangerous_objects": safety_analysis["dangerous_objects"],
            "safe": safety_analysis["safe"],
            "total_objects": safety_analysis["total_objects"]
        }
        
        # Generate audio warning if there are warnings
        if safety_analysis["warnings"]:
            try:
                # Combine all warnings into one message
                warning_text = " ".join(safety_analysis["warnings"])
                audio_path = text_to_speech(warning_text)
                response["audio_warning"] = audio_path
                response["warning_text"] = warning_text
            except Exception as e:
                logger.error(f"Failed to generate audio warning: {e}")
                response["audio_warning"] = None
        else:
            response["audio_warning"] = None
            response["warning_text"] = None
        
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing frame: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def stream_health():
    """
    Check if live stream service is healthy.
    """
    return {
        "status": "healthy",
        "service": "Live Camera Stream"
    }
