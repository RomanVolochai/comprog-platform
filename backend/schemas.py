from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LessonBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    status: str = Field(default="draft")

    concept_mdx: str = ""
    implementation_mdx: str = ""
    problem_mdx: str = ""


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = None
    concept_mdx: Optional[str] = None
    implementation_mdx: Optional[str] = None
    problem_mdx: Optional[str] = None


class LessonOut(LessonBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


