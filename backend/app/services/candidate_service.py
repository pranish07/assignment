from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import models, schemas
import json
import asyncio

class CandidateService:
    @staticmethod
    def get_candidates(
        db: Session, 
        status: str = None, 
        role_applied: str = None, 
        skill: str = None, 
        keyword: str = None, 
        skip: int = 0, 
        limit: int = 10
    ):
        query = db.query(models.Candidate).filter(models.Candidate.status != "archived")
        
        # This is where the "Debugging Signal" fix goes - filter in DB, not in Python
        if status:
            query = query.filter(models.Candidate.status == status)
        if role_applied:
            query = query.filter(models.Candidate.role_applied == role_applied)
        if skill:
            query = query.filter(models.Candidate.skills.contains(skill))
        if keyword:
            search = f"%{keyword}%"
            query = query.filter(
                or_(
                    models.Candidate.name.like(search),
                    models.Candidate.email.like(search),
                    models.Candidate.role_applied.like(search)
                )
            )
        
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_candidate_detail(db: Session, candidate_id: int, current_user: models.User):
        candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
        if not candidate:
            return None
        
        # Logic for scores visibility
        scores = candidate.scores
        if current_user.role == "reviewer":
            # Reviewer sees only their own scores
            candidate.scores = [s for s in scores if s.reviewer_id == current_user.id]
            # Reviewer cannot see internal notes
            candidate.internal_notes = None
        
        # Parse skills JSON
        candidate.skills = json.loads(candidate.skills) if candidate.skills else []
        
        return candidate

    @staticmethod
    def add_score(db: Session, candidate_id: int, score_in: schemas.ScoreCreate, user_id: int):
        # Update candidate status to 'reviewed' when a score is added if it was 'new'
        candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
        if candidate and candidate.status == 'new':
            candidate.status = 'reviewed'

        new_score = models.Score(
            candidate_id=candidate_id,
            category=score_in.category,
            score=score_in.score,
            reviewer_id=user_id,
            note=score_in.note
        )
        db.add(new_score)
        db.commit()
        db.refresh(new_score)

        # Notify SSE listeners if implemented
        # (This would involve a message queue or a shared state in a real app)
        
        return new_score

    @staticmethod
    async def generate_mock_summary(db: Session, candidate_id: int):
        # Simulate 2s delay
        await asyncio.sleep(2)
        
        candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
        if candidate:
            summary = f"Mock AI Summary for {candidate.name}: Candidate shows strong potential in {candidate.role_applied}. Skills include {candidate.skills}. Based on recent scoring, they are a recommended fit."
            candidate.summary = summary
            db.commit()
            db.refresh(candidate)
            return summary
        return None

    @staticmethod
    def archive_candidate(db: Session, candidate_id: int):
        candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
        if candidate:
            candidate.status = "archived"
            db.commit()
            db.refresh(candidate)
            return True
        return False
