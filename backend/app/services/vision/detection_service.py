from ultralytics import YOLO

# Load model only once when the server starts
model = YOLO("yolov8n.pt")


def detect_objects(image_path: str):
    """
    Detect objects in an image using YOLOv8.
    Returns list of objects with name, confidence, position, bounding box, and estimated distance.
    """
    results = model(image_path)

    detected_objects = []

    for result in results:
        image_width = result.orig_shape[1]
        image_height = result.orig_shape[0]
        image_area = image_width * image_height

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = model.names[class_id]

            if confidence < 0.5:
                continue

            # YOLO gives bounding box coordinates
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            center_x = (x1 + x2) / 2
            box_width = x2 - x1
            box_height = y2 - y1
            box_area = box_width * box_height

            # Position (Left / Center / Right based on center_x)
            if center_x < image_width / 3:
                position = "left"
            elif center_x < (2 * image_width / 3):
                position = "center"
            else:
                position = "right"

            # Distance heuristic based on relative bounding-box area
            # Larger box → closer object. This is a simple approximation
            # that works reasonably well for a monocular camera.
            area_ratio = box_area / image_area if image_area > 0 else 0
            if area_ratio > 0.20:
                distance = "very_close"
                distance_label = "Very Close"
            elif area_ratio > 0.08:
                distance = "close"
                distance_label = "Close"
            elif area_ratio > 0.02:
                distance = "medium"
                distance_label = "Medium"
            else:
                distance = "far"
                distance_label = "Far"

            detected_objects.append({
                "name": class_name,
                "confidence": round(confidence, 2),
                "position": position,
                "bbox": {
                    "x1": round(x1, 1),
                    "y1": round(y1, 1),
                    "x2": round(x2, 1),
                    "y2": round(y2, 1),
                    "image_width": image_width,
                    "image_height": image_height,
                },
                "distance": distance,
                "distance_label": distance_label,
                "area_ratio": round(area_ratio, 4),
            })

    return detected_objects
