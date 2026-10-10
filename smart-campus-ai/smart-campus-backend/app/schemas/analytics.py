from pydantic import BaseModel, ConfigDict, Field
from typing import List, Dict, Any

class QuadrantPoint(BaseModel):
    id: str
    student_id: str
    name: str
    x: float  # Academic Pillar
    y: float  # Placement Pillar
    z: float  # Success Score
    score: float
    department: str
    risk: str

    model_config = ConfigDict(populate_by_name=True)

class DepartmentStat(BaseModel):
    department: str
    dept: str
    total_students: int
    average_score: float
    high_risk: int
    moderate_risk: int
    good: int

    model_config = ConfigDict(populate_by_name=True)

class AnalyticsOverviewResponse(BaseModel):
    total_students: int
    totalStudents: int
    average_success_score: float
    averageSuccessScore: float
    academic_risk_count: int
    academicRiskCount: int
    placement_risk_count: int
    placementRiskCount: int
    department_breakdown: List[DepartmentStat]
    departmentBreakdown: List[DepartmentStat]
    quadrant_data: List[QuadrantPoint]
    quadrantData: List[QuadrantPoint]

    model_config = ConfigDict(populate_by_name=True)
