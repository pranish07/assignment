from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import json

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # 'admin' or 'reviewer'

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role_applied = Column(String, index=True)
    status = Column(String, index=True) # 'new', 'reviewed', 'hired', 'rejected'
    skills = Column(Text) # Store as JSON string
    internal_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    summary = Column(Text, nullable=True)

    scores = relationship("Score", back_populates="candidate")

class Score(Base):
    __tablename__ = "scores"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), index=True)
    category = Column(String)
    score = Column(Integer) # 1-5
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="scores")
    reviewer = relationship("User")
