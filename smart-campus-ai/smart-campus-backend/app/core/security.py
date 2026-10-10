"""
Security utilities: password hashing (PBKDF2) + HMAC token signing.
No third-party dependencies needed — uses Python stdlib only.
"""
import hashlib
import hmac
import os
import time

# Change this in production!
SECRET_KEY = "smartcampus-secret-key-do-not-share-2024"


# ── Password Hashing ────────────────────────────────────────────────────────

def hash_password(password: str) -> tuple[str, str]:
    """Returns (salt_hex, hash_hex). Store both in DB."""
    salt = os.urandom(32).hex()
    hashed = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000
    ).hex()
    return salt, hashed


def verify_password(password: str, salt: str, stored_hash: str) -> bool:
    """Returns True if password matches the stored salt+hash."""
    computed = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 200_000
    ).hex()
    return hmac.compare_digest(computed, stored_hash)


# ── Token Creation / Verification ───────────────────────────────────────────

def create_token(user_id: str, role: str) -> str:
    """Creates a signed token: '{user_id}|{role}|{ts}|{sig}'"""
    payload = f"{user_id}|{role}|{int(time.time())}"
    sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}|{sig}"


def decode_token(token: str) -> dict | None:
    """Returns {'user_id': ..., 'role': ..., 'ts': ...} or None if invalid/tampered."""
    try:
        *payload_parts, sig = token.split("|")
        if len(payload_parts) != 3:
            return None
        payload = "|".join(payload_parts)
        expected_sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        user_id, role, ts = payload_parts
        return {"user_id": user_id, "role": role, "ts": int(ts)}
    except Exception:
        return None
