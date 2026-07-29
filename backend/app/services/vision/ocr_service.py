import cv2
import easyocr
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Lazy load the OCR reader to avoid heavy startup imports and memory spikes.
_ocr_reader: Optional[easyocr.Reader] = None
_ocr_available = True


def get_ocr_reader() -> Optional[easyocr.Reader]:
    global _ocr_reader, _ocr_available

    if not _ocr_available:
        return None

    if _ocr_reader is None:
        try:
            _ocr_reader = easyocr.Reader(['en'], gpu=False)
        except RuntimeError as e:
            logger.error(f"Failed to initialize OCR reader: {e}")
            _ocr_available = False
            _ocr_reader = None
        except Exception as e:
            logger.exception("Unexpected failure initializing OCR reader")
            _ocr_available = False
            _ocr_reader = None

    return _ocr_reader


def extract_text(image_path: str):
    reader = get_ocr_reader()
    if reader is None:
        logger.warning("OCR reader unavailable; skipping text extraction.")
        return ""

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    try:
        results = reader.readtext(image)
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        return ""

    extracted_text = " ".join([item[1] for item in results])
    return extracted_text
