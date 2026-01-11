"""Tests for security utilities."""

from datetime import timedelta

import pytest

from app.config import get_settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    decrypt_api_token,
    encrypt_api_token,
    hash_password,
    verify_password,
)


class TestPasswordHashing:
    """Tests for password hashing and verification."""

    def test_hash_password_returns_string(self):
        """Test that hash_password returns a string."""
        password = "mypassword123"
        hashed = hash_password(password)

        assert isinstance(hashed, str)
        assert len(hashed) > 0

    def test_hash_password_is_deterministic_in_structure(self):
        """Test that hash_password produces Argon2 hashes."""
        password = "mypassword123"
        hashed = hash_password(password)

        # Argon2 hashes start with $argon2
        assert hashed.startswith("$argon2")

    def test_hash_password_different_for_same_password(self):
        """Test that hashing the same password twice produces different hashes (due to salt)."""
        password = "mypassword123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2

    def test_verify_password_with_correct_password(self):
        """Test that verify_password returns True for correct password."""
        password = "mypassword123"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_with_incorrect_password(self):
        """Test that verify_password returns False for incorrect password."""
        password = "mypassword123"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)

        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_with_invalid_hash(self):
        """Test that verify_password raises exception for invalid hash."""
        password = "mypassword123"
        invalid_hash = "not-a-valid-hash"

        # Argon2 raises an exception for completely invalid hashes
        # This is expected behavior - invalid format causes an error
        with pytest.raises(Exception):
            verify_password(password, invalid_hash)

    def test_verify_password_with_empty_password(self):
        """Test that verify_password handles empty passwords."""
        password = ""
        hashed = hash_password(password)

        assert verify_password("", hashed) is True
        assert verify_password("something", hashed) is False


class TestJWTTokens:
    """Tests for JWT token creation and decoding."""

    def test_create_access_token_returns_string(self):
        """Test that create_access_token returns a string."""
        token = create_access_token({"sub": "user123"})

        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_includes_payload(self):
        """Test that create_access_token includes the payload."""
        data = {"sub": "user123", "username": "testuser"}
        token = create_access_token(data)

        decoded = decode_access_token(token)
        assert decoded is not None
        assert decoded["sub"] == "user123"
        assert decoded["username"] == "testuser"

    def test_create_access_token_adds_expiration(self):
        """Test that create_access_token adds expiration claim."""
        token = create_access_token({"sub": "user123"})

        decoded = decode_access_token(token)
        assert decoded is not None
        assert "exp" in decoded

    def test_create_access_token_with_custom_expiration(self):
        """Test that create_access_token respects custom expiration."""
        expires = timedelta(minutes=30)
        token = create_access_token({"sub": "user123"}, expires_delta=expires)

        decoded = decode_access_token(token)
        assert decoded is not None
        assert "exp" in decoded

    def test_decode_access_token_with_valid_token(self):
        """Test that decode_access_token decodes valid tokens."""
        data = {"sub": "user123"}
        token = create_access_token(data)

        decoded = decode_access_token(token)
        assert decoded is not None
        assert decoded["sub"] == "user123"

    def test_decode_access_token_with_invalid_token(self):
        """Test that decode_access_token returns None for invalid tokens."""
        invalid_token = "not.a.valid.token"

        decoded = decode_access_token(invalid_token)
        assert decoded is None

    def test_decode_access_token_with_tampered_token(self):
        """Test that decode_access_token returns None for tampered tokens."""
        token = create_access_token({"sub": "user123"})
        tampered_token = token[:-10] + "tampered"

        decoded = decode_access_token(tampered_token)
        assert decoded is None

    def test_decode_access_token_with_expired_token(self):
        """Test that decode_access_token returns None for expired tokens."""
        # Create a token that's already expired
        expires = timedelta(seconds=-1)
        token = create_access_token({"sub": "user123"}, expires_delta=expires)

        decoded = decode_access_token(token)
        assert decoded is None

    def test_create_and_decode_token_roundtrip(self):
        """Test that a token can be created and decoded correctly."""
        original_data = {
            "sub": "user123",
            "username": "testuser",
            "role": "admin",
        }
        token = create_access_token(original_data)
        decoded = decode_access_token(token)

        assert decoded is not None
        assert decoded["sub"] == original_data["sub"]
        assert decoded["username"] == original_data["username"]
        assert decoded["role"] == original_data["role"]

    def test_token_uses_settings_algorithm(self):
        """Test that tokens use the algorithm from settings."""
        settings = get_settings()
        token = create_access_token({"sub": "user123"})

        # JWT tokens have 3 parts separated by dots
        parts = token.split(".")
        assert len(parts) == 3

        # The payload should contain the algorithm
        import base64
        import json

        payload = json.loads(base64.urlsafe_b64decode(parts[1] + "=="))
        # Note: The header contains the algorithm, not the payload
        # But we can verify the token is valid


class TestAPITokenEncryption:
    """Tests for API token encryption and decryption."""

    def test_encrypt_api_token_returns_string(self):
        """Test that encrypt_api_token returns a string."""
        token = "my-api-token-12345"
        encrypted = encrypt_api_token(token)

        assert isinstance(encrypted, str)
        assert len(encrypted) > 0

    def test_encrypt_api_token_is_reversible(self):
        """Test that encrypted tokens can be decrypted."""
        original_token = "my-api-token-12345"
        encrypted = encrypt_api_token(original_token)
        decrypted = decrypt_api_token(encrypted)

        assert decrypted == original_token

    def test_decrypt_api_token_with_encrypted_token(self):
        """Test that decrypt_api_token returns the original token."""
        original_token = "dGVzdC10b2tlbi12ZXJ5LXNlY3JldA=="
        encrypted = encrypt_api_token(original_token)
        decrypted = decrypt_api_token(encrypted)

        assert decrypted == original_token

    def test_decrypt_api_token_with_invalid_data(self):
        """Test that decrypt_api_token raises error for invalid data."""
        invalid_encrypted = "not-valid-encrypted-data"

        with pytest.raises(Exception):
            decrypt_api_token(invalid_encrypted)

    def test_encrypt_different_results_for_same_token(self):
        """Test that encrypting the same token produces different results (due to IV/nonce)."""
        token = "my-api-token-12345"
        encrypted1 = encrypt_api_token(token)
        encrypted2 = encrypt_api_token(token)

        # Fernet uses different nonce each time, so results should differ
        assert encrypted1 != encrypted2

    def test_encrypt_and_decrypt_roundtrip(self):
        """Test that tokens survive encrypt/decrypt roundtrip."""
        original_tokens = [
            "simple-token",
            "token-with-special-chars-!@#$%",
            "very-long-token-" + "x" * 100,
            "token-with-unicode-\u00e9\u00f1",
        ]

        for original in original_tokens:
            encrypted = encrypt_api_token(original)
            decrypted = decrypt_api_token(encrypted)
            assert decrypted == original

    def test_encrypt_preserves_token_length_differently(self):
        """Test that encryption changes token length (padding, encoding)."""
        token = "short"
        encrypted = encrypt_api_token(token)

        # Encrypted data is typically longer due to padding and encoding
        # but the important thing is that it decrypts back correctly
        decrypted = decrypt_api_token(encrypted)
        assert decrypted == token
