from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..schemas import LessonCreate, LessonUpdate, LessonOut


router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/", response_model=List[LessonOut])
def list_lessons(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Search by title or slug"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(models.Lesson)
    if q:
        query = query.filter((models.Lesson.title.ilike(f"%{q}%")) | (models.Lesson.slug.ilike(f"%{q}%")))
    return query.order_by(models.Lesson.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post("/", response_model=LessonOut)
def create_lesson(payload: LessonCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Lesson).filter(models.Lesson.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    lesson = models.Lesson(**payload.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.put("/{lesson_id}", response_model=LessonOut)
def update_lesson(lesson_id: int, payload: LessonUpdate, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if payload.slug and payload.slug != lesson.slug:
        exists = db.query(models.Lesson).filter(models.Lesson.slug == payload.slug).first()
        if exists:
            raise HTTPException(status_code=400, detail="Slug already exists")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(lesson, key, value)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}", status_code=204)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return None


