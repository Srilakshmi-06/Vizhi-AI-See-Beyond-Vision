from pydantic import BaseModel


class AssistantResponse(BaseModel):
    success: bool
    agent: str
    response: str