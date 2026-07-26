from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import FileResponse
import os

from app.services.speech.tts_service import text_to_speech_async

router = APIRouter(
    prefix="/api/tts",
    tags=["Text-to-Speech"]
)


@router.post("/")
async def convert_text_to_speech(
    text: str = Form(...),
    voice: str = Form(default="en-US-AriaNeural")
):
    """
    Convert text to speech and return audio file.
    
    Args:
        text: Text to convert to speech
        voice: Voice to use (default: en-US-AriaNeural)
    
    Returns:
        Audio file (MP3)
    """
    try:
        audio_path = await text_to_speech_async(text, voice)
        
        if not os.path.exists(audio_path):
            raise HTTPException(status_code=500, detail="Failed to generate audio")
        
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename="speech.mp3"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def list_voices():
    """
    Get list of available Edge TTS voices.
    
    Returns:
        List of available voices
    """
    from app.services.speech.tts_service import get_available_voices
    voices = await get_available_voices()
    return {"voices": voices}
