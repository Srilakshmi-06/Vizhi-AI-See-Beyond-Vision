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