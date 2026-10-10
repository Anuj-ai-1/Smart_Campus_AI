import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_token, decode_token
from app.core.auth_deps import require_auth
from app.models.user import User
from app.models.student import Student
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse, ChangePasswordRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Request Schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: Optional[str] = ""
    email: str
    password: str
    role: str = "faculty"             # "faculty" | "student"
    student_id: Optional[str] = None  # required when role == "student"


# ── Register / Activate Account ──────────────────────────────────────────────

@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new account or activate an enrolled student account:
    - Faculty: Creates a new faculty account with name, email, password.
    - Student: Enforces enrollment! Only students whose email was added by a faculty
      can activate their account and set their personal password.
    """
    email = request.email.strip().lower()
    role = request.role.lower()

    if role not in ("faculty", "student"):
        raise HTTPException(status_code=400, detail="Role must be 'faculty' or 'student'.")

    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    # ── Faculty Registration ──────────────────────────────────────────────────
    if role == "faculty":
        if not request.name or not request.name.strip():
            raise HTTPException(status_code=400, detail="Full name is required for faculty registration.")

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=409, detail="A user account with this email already exists.")

        salt, pw_hash = hash_password(request.password)
        user_id = f"FAC-{uuid.uuid4().hex[:8].upper()}"

        new_user = User(
            id=user_id,
            name=request.name.strip(),
            email=email,
            password_hash=pw_hash,
            salt=salt,
            role="faculty",
            title="Faculty Member",
            student_id=None,
            must_change_password=False,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_token(new_user.id, new_user.role)
        user_data = UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role=new_user.role,
            title=new_user.title,
            student_id=None,
            studentId=None,
            must_change_password=False,
            mustChangePassword=False,
        )
        return LoginResponse(
            user=user_data,
            accessToken=token,
            access_token=token,
            id=user_data.id,
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            title=user_data.title,
            studentId=None,
            student_id=None,
            must_change_password=False,
            mustChangePassword=False,
        )

    # ── Student Registration (Enforced Enrollment) ───────────────────────────
    # A student can ONLY register if faculty has already added their student record!
    student = db.query(Student).filter(Student.email == email).first()
    if not student and request.student_id:
        student = db.query(Student).filter(Student.student_id == request.student_id.strip().upper()).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Your email is not enrolled by faculty. Only pre-enrolled students can access the portal. Please contact your faculty coordinator."
        )

    # Student is enrolled! Check if User account already exists
    salt, pw_hash = hash_password(request.password)
    user = db.query(User).filter((User.email == student.email) | (User.student_id == student.student_id)).first()

    if user:
        # Student is activating their account by setting their personal password
        user.password_hash = pw_hash
        user.salt = salt
        user.must_change_password = False
        if request.name and request.name.strip():
            user.name = request.name.strip()
            student.name = request.name.strip()
    else:
        # Create user account for student
        user = User(
            id=student.student_id,
            name=student.name,
            email=student.email,
            password_hash=pw_hash,
            salt=salt,
            role="student",
            title=f"{student.department} · Semester {student.semester}",
            student_id=student.student_id,
            must_change_password=False,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    token = create_token(user.id, user.role)
    user_data = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        title=user.title,
        student_id=user.student_id,
        studentId=user.student_id,
        must_change_password=False,
        mustChangePassword=False,
    )
    return LoginResponse(
        user=user_data,
        accessToken=token,
        access_token=token,
        id=user_data.id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        title=user_data.title,
        studentId=user_data.studentId,
        student_id=user_data.student_id,
        must_change_password=False,
        mustChangePassword=False,
    )


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate with email + password. Returns a signed Bearer token.
    """
    if not request.email or not request.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required.",
        )

    email = request.email.strip().lower()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Also allow student to login using their Student ID as identifier
        user = db.query(User).filter(User.student_id == email.upper()).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email or Student ID.",
        )

    # Role check
    if request.role and user.role != request.role.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This account is registered as '{user.role}', not '{request.role}'. Please select the correct portal tab.",
        )

    # Verify password
    if not verify_password(request.password, user.salt, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password.",
        )

    token = create_token(user.id, user.role)
    must_change = bool(user.must_change_password)
    user_cohorts = user.assigned_cohorts or "[]"
    user_data = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        title=user.title,
        student_id=user.student_id,
        studentId=user.student_id,
        must_change_password=must_change,
        mustChangePassword=must_change,
        assigned_cohorts=user_cohorts,
        assignedCohorts=user_cohorts,
    )
    return LoginResponse(
        user=user_data,
        accessToken=token,
        access_token=token,
        id=user_data.id,
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        title=user_data.title,
        studentId=user_data.studentId,
        student_id=user_data.student_id,
        must_change_password=must_change,
        mustChangePassword=must_change,
        assigned_cohorts=user_cohorts,
        assignedCohorts=user_cohorts,
    )


# ── Change Password ──────────────────────────────────────────────────────────

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """
    Allows any authenticated user (faculty or student) to update their password.
    """
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if not verify_password(request.current_password, user.salt, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters.",
        )

    salt, pw_hash = hash_password(request.new_password)
    user.salt = salt
    user.password_hash = pw_hash
    user.must_change_password = False
    db.commit()

    return {"success": True, "message": "Password changed successfully."}


# ── Get Current User ──────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(require_auth), db: Session = Depends(get_db)):
    """Returns the currently authenticated user's profile."""
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    must_change = bool(user.must_change_password)
    user_cohorts = user.assigned_cohorts or "[]"
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        title=user.title,
        student_id=user.student_id,
        studentId=user.student_id,
        must_change_password=must_change,
        mustChangePassword=must_change,
        assigned_cohorts=user_cohorts,
        assignedCohorts=user_cohorts,
    )


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post("/logout")
def logout():
    """Stateless logout — client clears the token."""
    return {"success": True, "message": "Logged out successfully."}
