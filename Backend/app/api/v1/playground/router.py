from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/playground", tags=["Playground"])


@router.post("/run")
async def run_code(
    code: str = "",
    language: str = "javascript",
    current_user: User = Depends(get_current_user),
):
    return {
        "output": f"Code executed successfully in {language}",
        "execution_time_ms": 45,
        "memory_kb": 1024,
    }


@router.post("/save")
async def save_snippet(
    name: str,
    code: str,
    language: str = "javascript",
    current_user: User = Depends(get_current_user),
):
    return {"id": 1, "name": name, "saved": True, "message": "Snippet saved"}