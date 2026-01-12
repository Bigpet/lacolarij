"""Authentication API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies import CurrentUser, UserRepo
from app.models.schemas import Token, UserCreate, UserResponse
from app.services.demo_init import DEMO_PASSWORD, DEMO_USERNAME

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, user_repo: UserRepo) -> UserResponse:
    """Register a new user account."""
    # Check if username already exists
    existing_user = await user_repo.get_by_username(user_data.username)
    if existing_user:
        raise ConflictError(detail="Username already registered")

    # Create user with hashed password
    password_hash = hash_password(user_data.password)
    user = await user_repo.create(
        username=user_data.username,
        password_hash=password_hash,
    )

    return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    user_repo: UserRepo,
) -> Token:
    """Login and get an access token."""
    # Find user by username
    user = await user_repo.get_by_username(form_data.username)
    if not user:
        raise AuthenticationError(detail="Invalid username or password")

    # Verify password
    if not verify_password(form_data.password, user.password_hash):
        raise AuthenticationError(detail="Invalid username or password")

    # Create access token
    access_token = create_access_token(data={"sub": user.id})

    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUser) -> UserResponse:
    """Get the current authenticated user's information."""
    return UserResponse.model_validate(current_user)


@router.post("/demo-login", response_model=Token)
async def demo_login(user_repo: UserRepo) -> Token:
    """Login as demo user without credentials.

    This endpoint allows users to try the app with pre-seeded demo data
    without creating an account.
    """
    # Find demo user
    user = await user_repo.get_by_username(DEMO_USERNAME)
    if not user:
        raise AuthenticationError(detail="Demo user not found")

    # Create access token
    access_token = create_access_token(data={"sub": user.id})

    return Token(access_token=access_token)
