from app.services.llm.ollama_service import planner_llm

VALID_AGENTS = {
    "ocr": "OCR",
    "object detection": "Object Detection",
    "navigation": "Navigation",
    "emergency": "Emergency",
    "conversation": "Conversation",
    "scene description": "Scene Description",
}

def decide_agent(query: str):
    raw = planner_llm(query).strip().lower()

    # Exact match
    if raw in VALID_AGENTS:
        return {"agent": VALID_AGENTS[raw]}

    # Find any valid agent name inside the response
    for key, value in VALID_AGENTS.items():
        if key in raw:
            return {"agent": value}

    # Safe fallback
    return {"agent": "Conversation"}