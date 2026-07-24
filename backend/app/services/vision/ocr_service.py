import cv2
import easyocr

# Load the OCR model only once
reader = easyocr.Reader(['en'])

def extract_text(image_path: str):
    # Read image
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Run OCR
    results = reader.readtext(image)

    extracted_text = " ".join([item[1] for item in results])

    return extracted_text