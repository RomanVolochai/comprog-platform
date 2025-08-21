from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas, auth

router = APIRouter(tags=["implementations"])


@router.get("/", response_model=List[schemas.ImplementationOut])
def list_implementations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
    q: str | None = Query(default=None, description="Search by title or slug"),
    difficulty: str | None = Query(default=None, description="Filter by difficulty"),
    tags: str | None = Query(default=None, description="Filter by tags"),
    status: str | None = Query(default=None, description="Filter by status"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(models.Implementation)
    
    # Non-admin users can only see published implementations
    if not current_user.is_admin:
        query = query.filter(models.Implementation.status == "published")
    
    # Apply search filter
    if q:
        query = query.filter(
            (models.Implementation.title.ilike(f"%{q}%")) | 
            (models.Implementation.slug.ilike(f"%{q}%")) |
            (models.Implementation.description.ilike(f"%{q}%"))
        )
    
    # Apply difficulty filter
    if difficulty:
        query = query.filter(models.Implementation.difficulty == difficulty)
    
    # Apply tags filter
    if tags:
        query = query.filter(models.Implementation.tags.ilike(f"%{tags}%"))
    
    # Apply status filter
    if status:
        query = query.filter(models.Implementation.status == status)
    
    return query.order_by(models.Implementation.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{implementation_id}", response_model=schemas.ImplementationDetail)
def get_implementation(
    implementation_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Implementation).filter(models.Implementation.id == implementation_id)
    
    # Non-admin users can only see published implementations
    if not current_user.is_admin:
        query = query.filter(models.Implementation.status == "published")
    
    implementation = query.first()
    if not implementation:
        raise HTTPException(status_code=404, detail="Implementation not found")
    return implementation


@router.post("/", response_model=schemas.ImplementationOut)
def create_implementation(
    payload: schemas.ImplementationCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    existing = db.query(models.Implementation).filter(models.Implementation.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    implementation = models.Implementation(**payload.model_dump(), author_id=current_user.id)
    db.add(implementation)
    db.commit()
    db.refresh(implementation)
    return implementation


@router.put("/{implementation_id}", response_model=schemas.ImplementationOut)
def update_implementation(
    implementation_id: int, 
    payload: schemas.ImplementationUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    implementation = db.query(models.Implementation).filter(models.Implementation.id == implementation_id).first()
    if not implementation:
        raise HTTPException(status_code=404, detail="Implementation not found")
    
    # Check if user is author or admin
    if implementation.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if payload.slug and payload.slug != implementation.slug:
        exists = db.query(models.Implementation).filter(models.Implementation.slug == payload.slug).first()
        if exists:
            raise HTTPException(status_code=400, detail="Slug already exists")
    
    # Update published_at when status changes to published
    if payload.status == "published" and implementation.status != "published":
        payload.published_at = datetime.utcnow()
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(implementation, key, value)
    
    db.add(implementation)
    db.commit()
    db.refresh(implementation)
    return implementation


@router.delete("/{implementation_id}", status_code=204)
def delete_implementation(
    implementation_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    implementation = db.query(models.Implementation).filter(models.Implementation.id == implementation_id).first()
    if not implementation:
        raise HTTPException(status_code=404, detail="Implementation not found")
    
    # Check if user is author or admin
    if implementation.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(implementation)
    db.commit()
    return None


@router.post("/{implementation_id}/publish", response_model=schemas.ImplementationOut)
def publish_implementation(
    implementation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    implementation = db.query(models.Implementation).filter(models.Implementation.id == implementation_id).first()
    if not implementation:
        raise HTTPException(status_code=404, detail="Implementation not found")
    
    implementation.status = "published"
    implementation.published_at = datetime.utcnow()
    
    db.add(implementation)
    db.commit()
    db.refresh(implementation)
    return implementation
