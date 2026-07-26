from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
import os

from app.utils.file_utils import save_uploaded_file
from app.services.assistant.assistant_service import process_request

router = APIRouter(
    prefix="/api/assistant",
    tags=["Assistant"]
)

@router.post("/")
async def assistant(
    user_input: str = Form(...),
    image: UploadFile = File(...),
    include_audio: bool = Form(default=True)
):
    """
    Process user voice command with image.
    
    Args:
        user_input: User's command (transcribed text)
        image: Image from camera
        include_audio: Whether to generate audio response
    
    Returns:
        {
            "success": bool,
            "agent": str,
            "response": str,
            "audio_path": str (optional)
        }
    """
    image_path = save_uploaded_file(image)

    return process_request(user_input, image_path, include_audio)


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Retrieve generated audio file.
    
    Args:
        filename: Name of the audio file
    
    Returns:
        Audio file
    """
    audio_path = os.path.join("audio_outputs", filename)
    
    if not os.path.exists(audio_path):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename=filename
    )