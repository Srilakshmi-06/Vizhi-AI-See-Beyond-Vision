from ollama import chat

MODEL = "llama3.2:3b"

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
    ...