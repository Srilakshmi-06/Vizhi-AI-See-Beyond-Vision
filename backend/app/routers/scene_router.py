from fastapi import APIRouter, UploadFile, File
from app.utils.file_utils import save_uploaded_file
import shutil
import os

from app.services.vision.scene_service import generate_scene_description

router = APIRouter(
    prefix="/scene",
    tags=["Scene Description"]
)


@router.post("/")
async def scene(file: UploadFile = File(...)):

    image_path = save_uploaded_file(file)

    return generate_scene_description(image_path)