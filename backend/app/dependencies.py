"""Shared dependencies."""
from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.database import get_db
from app.auth import verify_jwt_token
from app.models import User


async def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer token"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT token, or return mock user if no token."""
    # If no authorization header, use mock user
    if not authorization or not authorization.startswith("Bearer "):
        # Get or create mock user
        mock_telegram_id = 123456789
        result = await db.execute(select(User).where(User.telegram_id == mock_telegram_id))
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
        
        return user
    
    # Try to get user from token
    token = authorization.replace("Bearer ", "")
    telegram_id = verify_jwt_token(token)
    
    if not telegram_id:
        # If token invalid, use mock user
        mock_telegram_id = 123456789
        result = await db.execute(select(User).where(User.telegram_id == mock_telegram_id))
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
        
        return user
    
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
