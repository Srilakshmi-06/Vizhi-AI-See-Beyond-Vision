from fastapi import APIRouter

from app.models.planner_model import PlannerRequest
from app.services.planner.planner_service import decide_agent

router = APIRouter(prefix="/planner", tags=["Planner"])

@router.post("/")
def planner(request: PlannerRequest):

    return decide_agent(request.query)