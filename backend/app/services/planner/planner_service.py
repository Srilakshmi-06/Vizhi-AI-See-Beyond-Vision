from app.services.llm.ollama_service import planner_llm

VALID_AGENTS = {
    "ocr": "OCR",
    "object detection": "Object Detection",
    "scene description": "Scene Description",
    "navigation": "Navigation",
    "emergency": "Emergency",
    "conversation": "Conversation",
}


def decide_agent(query: str):
    """
    Uses the LLM to determine which agent should handle the user's request.
    Returns:
        {
            "agent": "<Agent Name>"
        }
    """

    normalized = (query or "").strip().lower()

    # Hard-coded phrase matching for voice commands and safety-critical phrases
    if any(phrase in normalized for phrase in [
        "read the sign", "what does this say", "read the menu", "read this label"
    ]):
        return {"agent": "OCR"}

    if any(phrase in normalized for phrase in [
        "describe my surroundings", "describe the room", "where am i", "what do you see", "what is around me"
    ]):
        return {"agent": "Scene Description"}

    if any(phrase in normalized for phrase in [
        "what is in front of me", "what is ahead", "what is ahead of me", "is there anything ahead"
    ]):
        return {"agent": "Object Detection"}

    if any(phrase in normalized for phrase in [
        "take me to", "guide me", "how do i get", "navigate", "direction", "where is " ]):
        return {"agent": "Navigation"}

    if any(phrase in normalized for phrase in [
        "help", "sos", "emergency", "i need help", "call for help"]):
        return {"agent": "Emergency"}

    raw_response = planner_llm(query).strip().lower()

    # Exact match
    if raw_response in VALID_AGENTS:
        return {
            "agent": VALID_AGENTS[raw_response]
        }

    # If the model returns extra text, find a valid agent name
    for key, value in VALID_AGENTS.items():
        if key in raw_response:
            return {
                "agent": value
            }

    # Default fallback
    return {
        "agent": "Conversation"
    }