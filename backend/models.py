from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    concepts = relationship("Concept", back_populates="author")
    implementations = relationship("Implementation", back_populates="author")
    problems = relationship("Problem", back_populates="author")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="", nullable=False)
    content_mdx = Column(Text, nullable=False)
    difficulty = Column(String(50), default="beginner", nullable=False)  # beginner, intermediate, advanced
    tags = Column(String(500), default="", nullable=False)  # comma-separated tags
    status = Column(String(50), default="draft", nullable=False)  # draft, published, archived
    
    # Metadata
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    published_at = Column(DateTime, nullable=True)

    # Relationships
    author = relationship("User", back_populates="concepts")


class Implementation(Base):
    __tablename__ = "implementations"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="", nullable=False)
    content_mdx = Column(Text, nullable=False)
    difficulty = Column(String(50), default="beginner", nullable=False)  # beginner, intermediate, advanced
    tags = Column(String(500), default="", nullable=False)  # comma-separated tags
    status = Column(String(50), default="draft", nullable=False)  # draft, published, archived
    
    # Metadata
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    published_at = Column(DateTime, nullable=True)

    # Relationships
    author = relationship("User", back_populates="implementations")


class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="", nullable=False)
    content_mdx = Column(Text, nullable=False)
    difficulty = Column(String(50), default="beginner", nullable=False)  # beginner, intermediate, advanced
    tags = Column(String(500), default="", nullable=False)  # comma-separated tags
    status = Column(String(50), default="draft", nullable=False)  # draft, published, archived
    
    # Metadata
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    published_at = Column(DateTime, nullable=True)

    # Relationships
    author = relationship("User", back_populates="problems")


