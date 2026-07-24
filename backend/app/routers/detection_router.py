from fastapi import APIRouter, UploadFile, File
import shutil
import os

from app.services.vision.detection_service import detect_objects

router = APIRouter(
    prefix="/detect",
    tags=["Object Detection"]
)


@router.post("/")
async def detect(file: UploadFile = File(...)):

    os.makedirs("uploads", exist_ok=True)

    image_path = f"uploads/{file.filename}"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    objects = detect_objects(image_path)

    return {
        "objects": objects
    }