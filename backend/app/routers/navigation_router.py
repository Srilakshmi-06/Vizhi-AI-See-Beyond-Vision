from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from typing import Optional
import logging

from app.services.navigation.navigation_service import get_navigation_instructions, provide_direction
from app.services.vision.detection_service import detect_objects
from app.utils.file_utils import save_uploaded_file
from app.services.speech.tts_service import text_to_speech

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/navigation",
    tags=["Navigation"]
)


@router.post("/navigate")
async def navigate(
    destination: str = Form(...),
    current_location: Optional[str] = Form(default=None),
    image: Optional[UploadFile] = File(default=None),
    include_audio: bool = Form(default=True)
):
    """
    Get navigation instructions to destination.
    
    Args:
        destination: Where the user wants to go
        current_location: Current location (optional)
        image: Current camera view (optional)
        include_audio: Whether to generate audio response
    
    Returns:
        Navigation instructions with optional audio
    """
    try:
        detected_objects = None
        
        # Detect obstacles if image is provided
        if image:
            image_path = save_uploaded_file(image)
            detected_objects = detect_objects(image_path)
        
        # Get navigation instructions
        nav_result = get_navigation_instructions(
            current_location,
            destination,
            detected_objects
        )
        
        # Generate audio if requested
        audio_path = None
        if include_audio:
            try:
                audio_path = text_to_speech(nav_result["instruction"])
            except Exception as e:
                logger.error(f"Failed to generate audio: {e}")
        
        return {
            **nav_result,
            "audio_path": audio_path
        }
        
    except Exception as e:
        logger.error(f"Navigation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/direction")
async def get_direction(
    direction: str = Form(...),
    distance: Optional[str] = Form(default=None),
    include_audio: bool = Form(default=True)
):
    """
    Provide directional guidance.
    
    Args:
        direction: Direction (left, right, forward, backward)
        distance: Distance information (optional)
        include_audio: Whether to generate audio response
    
    Returns:
        Direction instruction with optional audio
    """
    instruction = provide_direction(direction, distance)
    
    audio_path = None
    if include_audio:
        try:
            audio_path = text_to_speech(instruction)
        except Exception as e:
            logger.error(f"Failed to generate audio: {e}")
    
    return {
        "instruction": instruction,
        "audio_path": audio_path
    }
