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
            # How do we calculate position?
            # YOLO gives bounding box coordinates
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            center_x = (x1 + x2) / 2
            image_width = result.orig_shape[1]

            if center_x < image_width / 3:
                position = "left"
            elif center_x < (2 * image_width / 3):
                position = "center"
            else:
                position = "right"

            if confidence < 0.5:
                continue
            
            detected_objects.append(
                {
                   "name": class_name,
                   "confidence": round(confidence, 2),
                   "position": position
                }
            )

    return detected_objects