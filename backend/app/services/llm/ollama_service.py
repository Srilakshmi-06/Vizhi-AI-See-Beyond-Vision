import os
from ollama import chat

# Configurable via env variable — default to smaller model for constrained environments
MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

SYSTEM_PROMPT = """You are Vizhi AI's routing classifier. You MUST reply with EXACTLY one label and nothing else. NO punctuation, NO explanation.

Valid labels (choose one):
OCR
Object Detection
Navigation
Emergency
Scene Description
Conversation

Routing rules (with examples):
- "Read the sign", "What does this say", "Read the menu", "Read this label" -> OCR
- "What is in front of me", "What do you see", "Is there anything ahead" -> Object Detection
- "Describe my surroundings", "Describe the room", "Where am I" -> Scene Description
- "Take me to the kitchen", "How do I get to the door", "Guide me" -> Navigation
- "Help", "Help me", "SOS", "Emergency", "I need help" -> Emergency
- Anything else -> Conversation

Return ONLY the label. No other words."""


def planner_llm(query: str):
    """Classify a user query into one of the six agent categories."""
    response = chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Read the sign"},
            {"role": "assistant", "content": "OCR"},
            {"role": "user", "content": "Take me to the library"},
            {"role": "assistant", "content": "Navigation"},
            {"role": "user", "content": "help me"},
            {"role": "assistant", "content": "Emergency"},
            {"role": "user", "content": "describe my surroundings"},
            {"role": "assistant", "content": "Scene Description"},
            {"role": "user", "content": "what is in front of me"},
            {"role": "assistant", "content": "Object Detection"},
            {"role": "user", "content": query},
        ],
        options={"temperature": 0, "num_predict": 20},
    )

    return response["message"]["content"].strip()


def describe_scene(objects):
    """Generate a natural language scene description from detected objects."""
    if not objects:
        return "I couldn't detect any significant objects around you."

    object_list = []
    for obj in objects:
        object_list.append(f"- {obj['name']} ({obj['position']})")

    prompt = f"""You are Vizhi AI, an accessibility assistant for visually impaired users.

Detected objects:
{chr(10).join(object_list)}

Rules:
- ONLY describe the detected objects above.
- NEVER invent locations such as behind, far away, or nearby.
- ONLY use left, center, or right.
- NEVER assume movement.
- NEVER greet the user.
- Mention important obstacles (like vehicles or stairs) first.
- Keep the response under 35 words.
- Speak clearly and naturally, as if speaking to a blind user.
"""

    response = chat(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0.3, "num_predict": 120},
    )

    return response["message"]["content"].strip()
