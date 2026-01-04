"""Security utilities: password hashing, JWT tokens, and encryption."""

import base64
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.fernet import Fernet
from jose import JWTError, jwt

from app.config import get_settings

# Password hasher
_password_hasher = PasswordHasher()

# Fernet instance (lazy-loaded)
_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    """Get or create Fernet instance for encryption."""
    global _fernet
    if _fernet is None:
        settings = get_settings()
        if settings.encryption_key:
            key = settings.encryption_key.encode()
        else:
            # Generate a key from the secret_key if no encryption_key is set
            # This ensures consistency across restarts if secret_key is set
            key = base64.urlsafe_b64encode(
                settings.secret_key.encode()[:32].ljust(32, b"\0")
            )
        _fernet = Fernet(key)
    return _fernet


# --- Password Hashing ---


def hash_password(password: str) -> str:
    """Hash a password using Argon2."""
    return _password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    try:
        _password_hasher.verify(password_hash, password)
        return True
    except VerifyMismatchError:
        return False


# --- JWT Tokens ---


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    settings = get_settings()
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    """Decode and verify a JWT access token."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        return None


# --- API Token Encryption ---


def encrypt_api_token(token: str) -> str:
    """Encrypt an API token for storage."""
    fernet = _get_fernet()
    return fernet.encrypt(token.encode()).decode()


def decrypt_api_token(encrypted_token: str) -> str:
    """Decrypt an API token from storage."""
    fernet = _get_fernet()
    return fernet.decrypt(encrypted_token.encode()).decode()
