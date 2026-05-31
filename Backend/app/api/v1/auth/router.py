"""
Authentication Router
POST /auth/register — Create account
POST /auth/login    — Sign in (JSON)
POST /auth/token    — Sign in (Swagger OAuth2 form)
"""

from fastapi import APIRouter, Depends, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.v1.auth.service import AuthService
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    data: RegisterRequest = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account."""
    return await AuthService(db).register(data)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Login with email and password (JSON body)."""
    return await AuthService(db).login(data.email, data.password)


@router.post("/token")
async def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login for Swagger UI Authorize button (form data)."""
    result = await AuthService(db).login(form_data.username, form_data.password)
    return {
        "access_token": result.access_token,
        "token_type": result.token_type,
    }