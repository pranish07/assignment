from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from .. import models, schemas, auth
from ..auth import get_db, get_current_user, get_current_admin
from ..services.candidate_service import CandidateService
import json
import asyncio

router = APIRouter()

@router.get("/", response_model=schemas.PaginationResponse)
def get_candidates(
    status: Optional[str] = None,
    role_applied: Optional[str] = None,
    skill: Optional[str] = None,
    keyword: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    skip = (page - 1) * size
    items, total = CandidateService.get_candidates(
        db, status, role_applied, skill, keyword, skip, size
    )
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size
    }

@router.get("/{id}", response_model=schemas.CandidateDetailResponse)
def get_candidate(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    candidate = CandidateService.get_candidate_detail(db, id, current_user)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.post("/{id}/scores", response_model=schemas.ScoreResponse)
def add_score(
    id: int,
    score_in: schemas.ScoreCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return CandidateService.add_score(db, id, score_in, current_user.id)

@router.post("/{id}/summary")
async def trigger_summary(
    id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # In a real app, this would be an async task queue like Celery
    # For this assignment, we'll use FastAPI's BackgroundTasks or just await if the user wants it triggered immediately
    # The requirement says "simulates an async LLM call (2s delay)"
    # We'll return "Processing" and do it in background
    background_tasks.add_task(CandidateService.generate_mock_summary, db, id)
    return {"message": "AI Summary generation triggered. Please check back in a few seconds."}

@router.patch("/{id}", response_model=schemas.CandidateDetailResponse)
def update_candidate(
    id: int,
    update_in: schemas.CandidateUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin) # Only admin can edit internal notes
):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    if update_in.status:
        candidate.status = update_in.status
    if update_in.internal_notes:
        candidate.internal_notes = update_in.internal_notes
    
    db.commit()
    db.refresh(candidate)
    
    # Reload with full detail logic
    return CandidateService.get_candidate_detail(db, id, current_user)

# SSE Stretch Goal
@router.get("/{id}/stream")
async def stream_candidate_updates(id: int, current_user: models.User = Depends(get_current_user)):
    async def event_generator():
        while True:
            # In a real app, you'd use a Pub/Sub system (Redis)
            # For this simple mock, we'll just send a heartbeat or check for changes
            # Let's just send a heartbeat every 5 seconds for demonstration
            # In real use, when a score is added, it would be pushed to a queue and this would yield it
            data = json.dumps({"status": "live", "timestamp": str(asyncio.get_event_loop().time())})
            yield f"data: {data}\n\n"
            await asyncio.sleep(5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
@router.delete("/{id}")
def delete_candidate(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    success = CandidateService.archive_candidate(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"message": "Candidate archived successfully"}
