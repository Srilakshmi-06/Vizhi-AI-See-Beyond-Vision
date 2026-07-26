from app.services.planner.planner_service import decide_agent

from app.services.vision.ocr_service import extract_text
from app.services.vision.detection_service import detect_objects
from app.services.vision.scene_service import generate_scene_description
from app.models.assistant_response import AssistantResponse


def process_request(user_input: str, image_path: str):

    planner_result = decide_agent(user_input)

    agent = planner_result["agent"]

    if agent == "OCR":

        text = extract_text(image_path)

        return AssistantResponse(
            success=True,
            agent=agent,
            response=text
        )

    elif agent == "Object Detection":

        objects = detect_objects(image_path)

        return AssistantResponse(
            success=True,
            agent=agent,
            response=objects
        )

    elif agent == "Scene Description":

        scene = generate_scene_description(image_path)

        return AssistantResponse(
           success=True,
           agent=agent,
           response=scene["description"]
        )

    return AssistantResponse(
        success=False,
        agent="Conversation",
        response="Sorry, I couldn't understand your request."
    )