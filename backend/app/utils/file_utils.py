import os
import shutil
from fastapi import UploadFile


def save_uploaded_file(file: UploadFile) -> str:
    """
    Save an uploaded file to the uploads directory.
    Returns the saved file path.
    """

    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path