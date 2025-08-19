from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from .db import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="draft", nullable=False)

    concept_mdx = Column(Text, default="", nullable=False)
    implementation_mdx = Column(Text, default="", nullable=False)
    problem_mdx = Column(Text, default="", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


