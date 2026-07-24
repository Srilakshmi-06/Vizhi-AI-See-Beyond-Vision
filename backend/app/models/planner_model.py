from pydantic import BaseModel

class PlannerRequest(BaseModel):
    query: str