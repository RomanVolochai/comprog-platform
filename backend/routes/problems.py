from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas, auth

router = APIRouter(tags=["problems"])


@router.get("/", response_model=List[schemas.ProblemOut])
def list_problems(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
    q: str | None = Query(default=None, description="Search by title or slug"),
    difficulty: str | None = Query(default=None, description="Filter by difficulty"),
    tags: str | None = Query(default=None, description="Filter by tags"),
    status: str | None = Query(default=None, description="Filter by status"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(models.Problem)
    
    # Non-admin users can only see published problems
    if not current_user.is_admin:
        query = query.filter(models.Problem.status == "published")
    
    # Apply search filter
    if q:
        query = query.filter(
            (models.Problem.title.ilike(f"%{q}%")) | 
            (models.Problem.slug.ilike(f"%{q}%")) |
            (models.Problem.description.ilike(f"%{q}%"))
        )
    
    # Apply difficulty filter
    if difficulty:
        query = query.filter(models.Problem.difficulty == difficulty)
    
    # Apply tags filter
    if tags:
        query = query.filter(models.Problem.tags.ilike(f"%{tags}%"))
    
    # Apply status filter
    if status:
        query = query.filter(models.Problem.status == status)
    
    return query.order_by(models.Problem.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{problem_id}", response_model=schemas.ProblemDetail)
def get_problem(
    problem_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Problem).filter(models.Problem.id == problem_id)
    
    # Non-admin users can only see published problems
    if not current_user.is_admin:
        query = query.filter(models.Problem.status == "published")
    
    problem = query.first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


@router.post("/", response_model=schemas.ProblemOut)
def create_problem(
    payload: schemas.ProblemCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    existing = db.query(models.Problem).filter(models.Problem.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    problem = models.Problem(**payload.model_dump(), author_id=current_user.id)
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


@router.put("/{problem_id}", response_model=schemas.ProblemOut)
def update_problem(
    problem_id: int, 
    payload: schemas.ProblemUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if user is author or admin
    if problem.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if payload.slug and payload.slug != problem.slug:
        exists = db.query(models.Problem).filter(models.Problem.slug == payload.slug).first()
        if exists:
            raise HTTPException(status_code=400, detail="Slug already exists")
    
    # Update published_at when status changes to published
    if payload.status == "published" and problem.status != "published":
        payload.published_at = datetime.utcnow()
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(problem, key, value)
    
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


@router.delete("/{problem_id}", status_code=204)
def delete_problem(
    problem_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    # Check if user is author or admin
    if problem.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(problem)
    db.commit()
    return None


@router.post("/{problem_id}/publish", response_model=schemas.ProblemOut)
def publish_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    problem.status = "published"
    problem.published_at = datetime.utcnow()
    
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem
