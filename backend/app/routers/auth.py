"""Authentication router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.auth import validate_telegram_init_data, create_jwt_token
from app.models import User
from app.schemas import TelegramInitData, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/dev/mock", response_model=dict)
async def auth_dev_mock(
    db: AsyncSession = Depends(get_db),
):
    """DEV ONLY: Create or get mock user and return token (no auth required)."""
    # Use a fixed mock telegram_id
    mock_telegram_id = 123456789
    
    # Get or create mock user
    result = await db.execute(
        select(User).where(User.telegram_id == mock_telegram_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            telegram_id=mock_telegram_id,
            username="mock_user",
            first_name="Mock",
            last_name="User",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Create JWT token
    token = create_jwt_token(mock_telegram_id)
    
    return {
        "token": token,
        "user": UserResponse.model_validate(user),
    }


@router.post("/telegram", response_model=dict)
async def auth_telegram(
    init_data: TelegramInitData,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user via Telegram initData."""
    print(f"[Auth] Received auth request, init_data length: {len(init_data.init_data) if init_data.init_data else 0}")
    
    if not init_data.init_data or not init_data.init_data.strip():
        raise HTTPException(
            status_code=400,
            detail="init_data is required. Make sure the app is opened from Telegram."
        )
    
    user_data = validate_telegram_init_data(init_data.init_data)
    
    if not user_data:
        raise HTTPException(
            status_code=401,
            detail="Invalid Telegram initData. Check: 1) App opened from Telegram, 2) TELEGRAM_BOT_TOKEN is correct, 3) initData is not expired"
        )
    
    telegram_id = user_data.get("id")
    if not telegram_id:
        raise HTTPException(status_code=401, detail="Missing user ID in Telegram data")
    
    # Get or create user
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(
            telegram_id=telegram_id,
            username=user_data.get("username"),
            first_name=user_data.get("first_name"),
            last_name=user_data.get("last_name"),
            language_code=user_data.get("language_code"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update user info
        user.username = user_data.get("username") or user.username
        user.first_name = user_data.get("first_name") or user.first_name
        user.last_name = user_data.get("last_name") or user.last_name
        user.language_code = user_data.get("language_code") or user.language_code
        await db.commit()
        await db.refresh(user)
    
    # Create JWT token
    token = create_jwt_token(telegram_id)
    
    return {
        "token": token,
        "user": UserResponse.model_validate(user),
    }
