from app.services.planner.planner_service import decide_agent

from app.services.vision.ocr_service import extract_text
from app.services.vision.detection_service import detect_objects
from app.services.vision.scene_service import generate_scene_description
from app.services.speech.tts_service import text_to_speech
from app.models.assistant_response import AssistantResponse
import logging

logger = logging.getLogger(__name__)


def process_request(user_input: str, image_path: str, include_audio: bool = True):
    """
    Process user request through the planner and appropriate agent.
    
    Args:
        user_input: User's voice command (transcribed)
        image_path: Path to the uploaded image
        include_audio: Whether to generate audio response (default: True)
    
    Returns:
        AssistantResponse with text and optional audio
    """
    planner_result = decide_agent(user_input)

    agent = planner_result["agent"]
    response_text = ""
    audio_path = None

    if agent == "OCR":

        text = extract_text(image_path)
        
        if text and text.strip():
            response_text = f"The text reads: {text}"
        else:
            response_text = "I couldn't detect any text in the image."

    elif agent == "Object Detection":

        objects = detect_objects(image_path)
        
        if objects:
            object_names = [obj["name"] for obj in objects]
            response_text = f"I can see: {', '.join(object_names)}."
        else:
            response_text = "I couldn't detect any objects."

    elif agent == "Scene Description":

        scene = generate_scene_description(image_path)
        response_text = scene["description"]

    elif agent == "Navigation":
        response_text = "Navigation service is coming soon."
    
    elif agent == "Emergency":
        response_text = "Emergency service activated. Help is on the way."
    
    elif agent == "Conversation":
        response_text = "I'm here to help you. Please tell me what you need."
    
    else:
        response_text = "Sorry, I couldn't understand your request."

    # Generate audio response
    if include_audio and response_text:
        try:
            audio_path = text_to_speech(response_text)
        except Exception as e:
            logger.error(f"Failed to generate audio: {e}")
            audio_path = None

    return {
        "success": True,
        "agent": agent,
        "response": response_text,
        "audio_path": audio_path
    }