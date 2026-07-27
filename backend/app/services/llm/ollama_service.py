import os
from ollama import chat

# Configurable via env variable — default to smaller model for constrained environments
MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:1b")

SYSTEM_PROMPT = """
You are a routing classifier.

Choose exactly ONE label from this list:

OCR
Object Detection
Navigation
Emergency
Conversation
Scene Description

Rules:
- If the user wants to read text, signs, labels, menus, notices, medicine labels, or room numbers -> OCR.
- If the user asks what is around them, what is in front of them, or about obstacles -> Object Detection.
- If the user asks for directions or to go somewhere -> Navigation.
- If the user asks for help, SOS, or emergency assistance -> Emergency.
- If the user asks to describe the environment -> Scene Description.
- Otherwise -> Conversation.

Respond with ONLY the label, with no punctuation or extra words.
"""

def planner_llm(query: str):

    response = chat(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": query
            }
        ]
    )

    return response["message"]["content"].strip()

def describe_scene(objects):

    if not objects:
        return "I couldn't detect any significant objects around you."

    object_list = []

    for obj in objects:
        object_list.append(
            f"- {obj['name']} ({obj['position']})"
        )

    prompt = f"""
You are Vizhi AI, an accessibility assistant for visually impaired users.

Detected objects:

{objects}

Rules:

- ONLY describe the detected objects.
- NEVER invent locations such as behind, far away, or nearby.
- ONLY use left, center, or right.
- NEVER assume movement.
- NEVER greet the user.
- Mention important obstacles first.
- Keep the response below 35 words.
- Speak clearly and naturally.
"""

    response = chat(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"].strip()