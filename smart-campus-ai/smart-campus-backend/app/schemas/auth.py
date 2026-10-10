from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class LoginRequest(BaseModel):
    role: Optional[str] = "faculty"  # "faculty" | "student"
    email: Optional[str] = None
    student_id: Optional[str] = None
    studentId: Optional[str] = None
    password: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    title: str
    student_id: Optional[str] = None
    studentId: Optional[str] = None
    must_change_password: bool = False
    mustChangePassword: bool = False
    assigned_cohorts: Optional[str] = "[]"
    assignedCohorts: Optional[str] = "[]"

    model_config = ConfigDict(populate_by_name=True)

class LoginResponse(BaseModel):
    user: UserResponse
    accessToken: str
    access_token: str
    token_type: str = "bearer"

    # Direct user fields flattened for frontend convenience
    id: str
    name: str
    email: str
    role: str
    title: str
    studentId: Optional[str] = None
    student_id: Optional[str] = None
    must_change_password: bool = False
    mustChangePassword: bool = False
    assigned_cohorts: Optional[str] = "[]"
    assignedCohorts: Optional[str] = "[]"

    model_config = ConfigDict(populate_by_name=True)

