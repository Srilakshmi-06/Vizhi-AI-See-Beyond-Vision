from fastapi import APIRouter, UploadFile, File
import shutil
import os

from app.services.vision.ocr_service import extract_text

router = APIRouter(
    prefix="/ocr",
    tags=["OCR"]
)

@router.post("/")
async def ocr(file: UploadFile = File(...)):

    os.makedirs("uploads", exist_ok=True)

    image_path = f"uploads/{file.filename}"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(image_path)

    return {
        "text": text
    }