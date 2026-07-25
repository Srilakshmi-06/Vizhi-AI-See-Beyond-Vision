from fastapi import APIRouter, UploadFile, File
from app.utils.file_utils import save_uploaded_file
import shutil
import os

from app.services.vision.detection_service import detect_objects

router = APIRouter(
    prefix="/detect",
    tags=["Object Detection"]
)


@router.post("/")
async def detect(file: UploadFile = File(...)):

    image_path = save_uploaded_file(file) 

    objects = detect_objects(image_path)

    return {
        "objects": objects
    }