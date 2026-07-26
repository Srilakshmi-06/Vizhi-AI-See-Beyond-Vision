from fastapi import APIRouter, Form, HTTPException
from typing import Optional
import logging

from app.services.emergency.emergency_service import trigger_emergency, cancel_emergency
from app.services.speech.tts_service import text_to_speech

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/emergency",
    tags=["Emergency"]
)


@router.post("/trigger")
async def emergency_trigger(
    user_id: Optional[str] = Form(default=None),
    location: Optional[str] = Form(default=None),
    emergency_type: str = Form(default="general"),
    include_audio: bool = Form(default=True)
):
    """
    Trigger emergency SOS.
    
    Args:
        user_id: User identifier (optional)
        location: Current location (optional)
        emergency_type: Type of emergency (general, medical, accident)
        include_audio: Whether to generate audio response
    
    Returns:
        Emergency response with optional audio
    """
    try:
        # Trigger emergency
        result = trigger_emergency(user_id, location, emergency_type)
        
        # Generate audio response
        audio_path = None
        if include_audio:
            try:
                audio_path = text_to_speech(result["message"])
            except Exception as e:
                logger.error(f"Failed to generate audio: {e}")
        
        return {
            **result,
            "audio_path": audio_path
        }
        
    except Exception as e:
        logger.error(f"Emergency trigger error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cancel")
async def emergency_cancel(
    emergency_id: str = Form(...),
    include_audio: bool = Form(default=True)
):
    """
    Cancel emergency alert.
    
    Args:
        emergency_id: Emergency ID to cancel
        include_audio: Whether to generate audio response
    
    Returns:
        Cancellation confirmation with optional audio
    """
    try:
        result = cancel_emergency(emergency_id)
        
        audio_path = None
        if include_audio:
            try:
                audio_path = text_to_speech(result["message"])
            except Exception as e:
                logger.error(f"Failed to generate audio: {e}")
        
        return {
            **result,
            "audio_path": audio_path
        }
        
    except Exception as e:
        logger.error(f"Emergency cancel error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def emergency_health():
    """
    Check emergency service health.
    """
    return {
        "status": "operational",
        "service": "Emergency SOS"
    }
