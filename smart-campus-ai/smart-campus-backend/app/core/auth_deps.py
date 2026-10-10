"""
FastAPI dependency: extract and verify the Bearer token from Authorization header.
Usage: current_user: dict = Depends(require_auth)
Returns: {"user_id": str, "role": str}
"""
from fastapi import Depends, HTTPException, status, Header
from typing import Optional
from app.core.security import decode_token


def require_auth(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency that requires a valid Bearer token. Returns decoded user dict."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.removeprefix("Bearer ").strip()
    user = decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or has been tampered with. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_faculty(current_user: dict = Depends(require_auth)) -> dict:
    """Dependency that requires the user to be a faculty member or admin."""
    if current_user["role"] not in ("faculty", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to faculty and admin accounts only.",
        )
    return current_user


def require_admin(current_user: dict = Depends(require_auth)) -> dict:
    """Dependency that requires the user to be a central administrator."""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to central administrative accounts only.",
        )
    return current_user

