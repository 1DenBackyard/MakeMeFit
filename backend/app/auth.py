"""Telegram authentication utilities."""
import hashlib
import hmac
from urllib.parse import parse_qsl, unquote
from typing import Dict, Optional
import jwt
from datetime import datetime, timedelta

from app.config import settings


def validate_telegram_init_data(init_data: str) -> Optional[Dict]:
    """
    Validate Telegram WebApp initData.
    
    Returns user data if valid, None otherwise.
    """
    try:
        # Parse init_data
        data = dict(parse_qsl(init_data))
        
        # Extract hash
        received_hash = data.pop("hash", None)
        if not received_hash:
            return None
        
        # Create data check string
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(data.items())
        )
        
        # Calculate secret key
        secret_key = hmac.new(
            "WebAppData".encode(),
            settings.telegram_bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Verify hash
        if calculated_hash != received_hash:
            return None
        
        # Check auth_date (should be within last 24 hours)
        auth_date = int(data.get("auth_date", 0))
        if auth_date < (datetime.now().timestamp() - 86400):
            return None
        
        # Parse user data
        user_str = data.get("user")
        if not user_str:
            return None
        
        import json
        user_data = json.loads(user_str)
        
        return user_data
        
    except Exception:
        return None


def create_jwt_token(telegram_id: int) -> str:
    """Create JWT token for authenticated user."""
    payload = {
        "telegram_id": telegram_id,
        "exp": datetime.utcnow() + timedelta(days=30),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def verify_jwt_token(token: str) -> Optional[int]:
    """Verify JWT token and return telegram_id."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return payload.get("telegram_id")
    except Exception:
        return None
