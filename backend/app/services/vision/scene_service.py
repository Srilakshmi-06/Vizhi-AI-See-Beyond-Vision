from app.services.vision.detection_service import detect_objects
from app.services.llm.ollama_service import describe_scene


def generate_scene_description(image_path: str):

    objects = detect_objects(image_path)

    description = describe_scene(objects)

    return {
        "objects": objects,
        "description": description
    }