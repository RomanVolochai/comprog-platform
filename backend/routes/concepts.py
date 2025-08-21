from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models, schemas, auth

router = APIRouter(tags=["concepts"])


@router.get("/", response_model=List[schemas.ConceptOut])
def list_concepts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
    q: str | None = Query(default=None, description="Search by title or slug"),
    difficulty: str | None = Query(default=None, description="Filter by difficulty"),
    tags: str | None = Query(default=None, description="Filter by tags"),
    status: str | None = Query(default=None, description="Filter by status"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    query = db.query(models.Concept)
    
    # Non-admin users can only see published concepts
    if not current_user.is_admin:
        query = query.filter(models.Concept.status == "published")
    
    # Apply search filter
    if q:
        query = query.filter(
            (models.Concept.title.ilike(f"%{q}%")) | 
            (models.Concept.slug.ilike(f"%{q}%")) |
            (models.Concept.description.ilike(f"%{q}%"))
        )
    
    # Apply difficulty filter
    if difficulty:
        query = query.filter(models.Concept.difficulty == difficulty)
    
    # Apply tags filter
    if tags:
        query = query.filter(models.Concept.tags.ilike(f"%{tags}%"))
    
    # Apply status filter
    if status:
        query = query.filter(models.Concept.status == status)
    
    return query.order_by(models.Concept.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{concept_id}", response_model=schemas.ConceptDetail)
def get_concept(
    concept_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Concept).filter(models.Concept.id == concept_id)
    
    # Non-admin users can only see published concepts
    if not current_user.is_admin:
        query = query.filter(models.Concept.status == "published")
    
    concept = query.first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    return concept


@router.post("/", response_model=schemas.ConceptOut)
def create_concept(
    payload: schemas.ConceptCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    existing = db.query(models.Concept).filter(models.Concept.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    concept = models.Concept(**payload.model_dump(), author_id=current_user.id)
    db.add(concept)
    db.commit()
    db.refresh(concept)
    return concept


@router.put("/{concept_id}", response_model=schemas.ConceptOut)
def update_concept(
    concept_id: int, 
    payload: schemas.ConceptUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    concept = db.query(models.Concept).filter(models.Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # Check if user is author or admin
    if concept.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if payload.slug and payload.slug != concept.slug:
        exists = db.query(models.Concept).filter(models.Concept.slug == payload.slug).first()
        if exists:
            raise HTTPException(status_code=400, detail="Slug already exists")
    
    # Update published_at when status changes to published
    if payload.status == "published" and concept.status != "published":
        payload.published_at = datetime.utcnow()
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(concept, key, value)
    
    db.add(concept)
    db.commit()
    db.refresh(concept)
    return concept


@router.delete("/{concept_id}", status_code=204)
def delete_concept(
    concept_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    concept = db.query(models.Concept).filter(models.Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # Check if user is author or admin
    if concept.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(concept)
    db.commit()
    return None


@router.post("/{concept_id}/publish", response_model=schemas.ConceptOut)
def publish_concept(
    concept_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    concept = db.query(models.Concept).filter(models.Concept.id == concept_id).first()
    if not concept:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    concept.status = "published"
    concept.published_at = datetime.utcnow()
    
    db.add(concept)
    db.commit()
    db.refresh(concept)
    return concept
