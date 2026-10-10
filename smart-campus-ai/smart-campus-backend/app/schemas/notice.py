from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any
from datetime import datetime


class NoticeBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=5)
    category: str = Field(default="General")
    priority: str = Field(default="Normal")
    department: str = Field(default="All")
    target_year: str = Field(default="All")
    is_pinned: int = Field(default=0)
    attachment_url: Optional[str] = ""
    expires_at: Optional[str] = ""

    model_config = ConfigDict(populate_by_name=True)


class NoticeCreate(NoticeBase):
    pass


class NoticeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    department: Optional[str] = None
    target_year: Optional[str] = None
    is_pinned: Optional[int] = None
    attachment_url: Optional[str] = None
    expires_at: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class NoticeResponse(BaseModel):
    id: str
    title: str
    content: str
    category: str
    priority: str
    department: str
    target_year: str
    targetYear: str
    is_pinned: int
    isPinned: int
    attachment_url: str
    attachmentUrl: str
    author_id: str
    author_name: str
    authorName: str
    author_department: str
    authorDepartment: str
    created_at: str
    createdAt: str
    updated_at: str
    updatedAt: str
    expires_at: Optional[str] = ""
    expiresAt: Optional[str] = ""

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    @classmethod
    def from_orm_notice(cls, n: Any) -> "NoticeResponse":
        t_yr = str(getattr(n, "target_year", "All") or "All")
        is_pin = int(getattr(n, "is_pinned", 0) or 0)
        att_url = str(getattr(n, "attachment_url", "") or "")
        auth_name = str(getattr(n, "author_name", "") or "Faculty Administration")
        auth_dept = str(getattr(n, "author_department", "") or "Academic Affairs")
        c_at = str(getattr(n, "created_at", "") or "")
        u_at = str(getattr(n, "updated_at", "") or "")
        exp_at = str(getattr(n, "expires_at", "") or "")

        return cls(
            id=n.id,
            title=n.title,
            content=n.content,
            category=n.category or "General",
            priority=n.priority or "Normal",
            department=n.department or "All",
            target_year=t_yr,
            targetYear=t_yr,
            is_pinned=is_pin,
            isPinned=is_pin,
            attachment_url=att_url,
            attachmentUrl=att_url,
            author_id=n.author_id,
            author_name=auth_name,
            authorName=auth_name,
            author_department=auth_dept,
            authorDepartment=auth_dept,
            created_at=c_at,
            createdAt=c_at,
            updated_at=u_at,
            updatedAt=u_at,
            expires_at=exp_at,
            expiresAt=exp_at,
        )
