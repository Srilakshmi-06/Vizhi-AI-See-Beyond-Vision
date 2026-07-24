from ultralytics import YOLO

# Load model only once when the server starts
model = YOLO("yolov8n.pt")


def detect_objects(image_path: str):

    results = model(image_path)

    detected_objects = []

    for result in results:

        for box in result.boxes:

            class_id = int(box.cls[0])

            confidence = float(box.conf[0])

            class_name = model.names[class_id]

            detected_objects.append(
                {
                    "name": class_name,
                    "confidence": round(confidence, 2)
                }
            )

    return detected_objects