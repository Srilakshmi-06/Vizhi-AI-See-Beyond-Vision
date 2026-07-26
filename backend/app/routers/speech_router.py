from fastapi import APIRouter, UploadFile, File

from app.utils.file_utils import save_uploaded_file
from app.services.speech.whisper_service import transcribe_audio

router = APIRouter(
    prefix="/speech",
    tags=["Speech"]
)

@router.post("/")
async def speech(file: UploadFile = File(...)):

    audio_path = save_uploaded_file(file)

    return transcribe_audio(audio_path)