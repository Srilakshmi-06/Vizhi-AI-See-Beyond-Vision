from fastapi import APIRouter, UploadFile, File, Form

from app.utils.file_utils import save_uploaded_file
from app.services.assistant.assistant_service import process_request

router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"]
)

@router.post("/")
async def assistant(
    user_input: str = Form(...),
    image: UploadFile = File(...)
):
    image_path = save_uploaded_file(image)

    return process_request(user_input, image_path)