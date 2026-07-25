from fastapi import APIRouter, UploadFile, File
from app.utils.file_utils import save_uploaded_file
import shutil
import os

from app.services.vision.ocr_service import extract_text

router = APIRouter(
    prefix="/ocr",
    tags=["OCR"]
)

@router.post("/")
async def ocr(file: UploadFile = File(...)):

    image_path = save_uploaded_file(file) 

    text = extract_text(image_path)

    return {
        "text": text
    }