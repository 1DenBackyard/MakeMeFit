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
        if not init_data or not init_data.strip():
            print("[Auth] Error: init_data is empty")
            return None
        
        # Parse init_data
        data = dict(parse_qsl(init_data))
        
        # Extract hash
        received_hash = data.pop("hash", None)
        if not received_hash:
            print("[Auth] Error: hash is missing from init_data")
            return None
        
        # Create data check string
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(data.items())
        )
        
        # Check if bot token is configured
        if not settings.telegram_bot_token:
            print("[Auth] Error: TELEGRAM_BOT_TOKEN is not configured")
            return None
        
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
            print(f"[Auth] Error: Hash mismatch. Expected: {calculated_hash[:16]}..., Got: {received_hash[:16]}...")
            print(f"[Auth] Check if TELEGRAM_BOT_TOKEN matches the bot used to open the Mini App")
            return None
        
        # Check auth_date (should be within last 24 hours)
        auth_date = int(data.get("auth_date", 0))
        current_time = datetime.now().timestamp()
        if auth_date < (current_time - 86400):
            print(f"[Auth] Error: auth_date is too old. auth_date: {auth_date}, current: {current_time}")
            return None
        
        # Parse user data
        user_str = data.get("user")
        if not user_str:
            print("[Auth] Error: user data is missing from init_data")
            return None
        
        import json
        user_data = json.loads(user_str)
        
        print(f"[Auth] Success: User {user_data.get('id')} authenticated")
        return user_data
        
    except json.JSONDecodeError as e:
        print(f"[Auth] Error: Failed to parse user JSON: {e}")
        return None
    except Exception as e:
        print(f"[Auth] Error: Unexpected error during validation: {e}")
        import traceback
        traceback.print_exc()
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
