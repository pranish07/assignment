# TechKraft Recruitment Dashboard

An internal candidate scoring and review dashboard built for TechKraft Inc.

## Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite
- **Frontend**: React + Vite, Vanilla CSS (Premium Design)
- **Containerization**: Docker Compose

## Setup and Run Instructions

### Using Docker (Recommended)
1. Ensure you have Docker and Docker Compose installed.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Access the dashboard at `http://localhost:5173`
4. Access the API docs at `http://localhost:8000/docs`

### Using Local Environment
**Backend:**
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn app.main:app --reload`

**Frontend:**
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Demo Accounts
- **Admin**: `admin@techkraft.com` / `admin123`
- **Reviewer**: `reviewer@techkraft.com` / `reviewer123`

---

## Architecture Decision Records (ADR)

### 1. Service Layer Pattern
- **Context**: The logic for filtering, detail views, and scoring could have been placed directly in router handlers.
- **Decision**: We implemented a `Service` layer (`candidate_service.py`).
- **Trade-off**: Slightly more boilerplate, but provides a clean separation between HTTP handling and business logic, making unit testing significantly easier.

### 2. Frontend State Strategy
- **Context**: Deciding between Redux/Zustand or standard React State.
- **Decision**: Used local React state with re-fetching on mutations.
- **Trade-off**: Increased API calls on updates, but drastically reduced complexity and development time while ensuring "source of truth" consistency from the DB.

### 3. SQLite for Persistence
- **Context**: Need a database that supports indexes and relational data.
- **Decision**: Chose SQLite with SQLAlchemy.
- **Trade-off**: Not suitable for massive concurrent writes compared to PostgreSQL, but perfect for a 2.5h assignment with zero setup overhead while still demonstrating SQL proficiency.

---

## Debugging Signal: Bug Identification

### The Issue
In the provided snippet:
```python
all_candidates = db.execute("SELECT * FROM candidates").fetchall()
filtered = [c for c in all_candidates if c["status"] == status]
```
The logic performs **Application-level filtering**. It fetches the entire dataset from the database into the application's memory before filtering.

### Why it matters at scale
- **Performance**: As the table grows to millions of rows, fetching all data causes massive latency.
- **Memory**: The application will eventually run out of RAM (OOM) trying to hold the entire database in memory.
- **Bandwidth**: Huge amounts of unnecessary data are transferred between the DB and the App.

### Correct Approach
Use **Database-level filtering** with `WHERE` clauses and indexes. In SQLAlchemy (used in this project):
```python
# The filtering happens in the SQL engine, not Python memory
query = db.query(models.Candidate).filter(models.Candidate.status == status)
result = query.offset(skip).limit(limit).all()
```
Or raw SQL with proper parameterization:
```sql
-- SQLite uses ? for parameters
SELECT * FROM candidates WHERE status = ? LIMIT 20 OFFSET 0;
```

---

## Example API Calls

### Login (to get token)
```bash
curl -X 'POST' \
  'http://localhost:8000/auth/login' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin@techkraft.com&password=admin123'
```

### List Candidates (with Filter)
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8000/candidates/?status=new&role_applied=Full+Stack+Engineer"
```

### Submit Score
```bash
curl -X 'POST' \
  'http://localhost:8000/candidates/1/scores' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"category": "Technical", "score": 5, "note": "Excellent problem solver"}'
```

---

## Learning Reflection
Building this end-to-end reinforced the importance of balancing aesthetic "premium" feel with robust backend security (RBAC). Implementing the mock AI summary with background tasks demonstrated how to handle long-running processes without blocking the user interface.
