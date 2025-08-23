from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, validator
import re


# User schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)

    @validator('email')
    def validate_email(cls, v):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
            raise ValueError('Invalid email format')
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


# Base schemas for content modules
class ContentBase(BaseModel):
    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    description: str = ""
    content_mdx: str = ""
    difficulty: str = Field(default="beginner")  # beginner, intermediate, advanced
    tags: str = ""
    status: str = Field(default="draft")

    @validator('difficulty')
    def validate_difficulty(cls, v):
        valid_difficulties = ['beginner', 'intermediate', 'advanced']
        if v not in valid_difficulties:
            raise ValueError(f'Difficulty must be one of: {valid_difficulties}')
        return v

    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['draft', 'published']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {valid_statuses}')
        return v


# Concept schemas
class ConceptCreate(ContentBase):
    pass


class ConceptUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content_mdx: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None

    @validator('difficulty')
    def validate_difficulty(cls, v):
        if v is not None:
            valid_difficulties = ['beginner', 'intermediate', 'advanced']
            if v not in valid_difficulties:
                raise ValueError(f'Difficulty must be one of: {valid_difficulties}')
        return v

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ['draft', 'published']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of: {valid_statuses}')
        return v


class ConceptOut(ContentBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConceptDetail(ConceptOut):
    author: UserOut


# Implementation schemas
class ImplementationCreate(ContentBase):
    pass


class ImplementationUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content_mdx: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None

    @validator('difficulty')
    def validate_difficulty(cls, v):
        if v is not None:
            valid_difficulties = ['beginner', 'intermediate', 'advanced']
            if v not in valid_difficulties:
                raise ValueError(f'Difficulty must be one of: {valid_difficulties}')
        return v

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ['draft', 'published']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of: {valid_statuses}')
        return v


class ImplementationOut(ContentBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ImplementationDetail(ImplementationOut):
    author: UserOut


# Problem schemas
class ProblemCreate(ContentBase):
    pass


class ProblemUpdate(BaseModel):
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    content_mdx: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None

    @validator('difficulty')
    def validate_difficulty(cls, v):
        if v is not None:
            valid_difficulties = ['beginner', 'intermediate', 'advanced']
            if v not in valid_difficulties:
                raise ValueError(f'Difficulty must be one of: {valid_difficulties}')
        return v

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ['draft', 'published']
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of: {valid_statuses}')
        return v


class ProblemOut(ContentBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProblemDetail(ProblemOut):
    author: UserOut


