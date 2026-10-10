from pydantic import BaseModel, ConfigDict
from typing import Optional


class InterventionCreate(BaseModel):
    student_id: str
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Academic"
    due_date: Optional[str] = ""


class InterventionUpdate(BaseModel):
    status: Optional[str] = None  # pending, completed, verified
    student_notes: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None


class InterventionResponse(BaseModel):
    id: str
    student_id: str
    faculty_id: str
    title: str
    description: str
    category: str
    due_date: str
    status: str
    student_notes: str
    created_at: str
    updated_at: str

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
