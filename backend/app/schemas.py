from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Score Schemas
class ScoreBase(BaseModel):
    category: str
    score: int = Field(..., ge=1, le=5)
    note: Optional[str] = None

class ScoreCreate(ScoreBase):
    pass

class ScoreResponse(ScoreBase):
    id: int
    candidate_id: int
    reviewer_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Candidate Schemas
class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    role_applied: str
    status: str
    skills: List[str]

class CandidateCreate(CandidateBase):
    internal_notes: Optional[str] = None

class CandidateUpdate(BaseModel):
    status: Optional[str] = None
    internal_notes: Optional[str] = None

class CandidateListResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role_applied: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateDetailResponse(CandidateListResponse):
    skills: List[str]
    internal_notes: Optional[str] = None
    summary: Optional[str] = None
    scores: List[ScoreResponse]

    class Config:
        from_attributes = True

class PaginationResponse(BaseModel):
    items: List[CandidateListResponse]
    total: int
    page: int
    size: int
