import os
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Response, Query, APIRouter
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from models import User, UserCreate, UserRead, UserLogin, Task
from sqlmodel import select, Session, Field, SQLModel
from jose import jwt, JWTError
import secrets
from pydantic import BaseModel
from typing import Optional, List
from init_db import engine
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
import logging
import logging.config
import traceback

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'backend_debug.log',
            'formatter': 'default',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'DEBUG',
    },
}
logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger()

app = FastAPI()
api_router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "devsecret")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_session():
    with Session(engine) as session:
        yield session

# --- User registration endpoint ---
@api_router.post("/register", response_model=UserRead)
def register(user: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where((User.username == user.username) | (User.email == user.email))).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed = pwd_context.hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return UserRead.model_validate(db_user)

# --- User login endpoint (returns JWT) ---
@api_router.post("/login")
@api_router.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token_data = {"sub": user.username}
    expire = datetime.utcnow() + timedelta(minutes=60)
    token_data["exp"] = expire
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

# --- Get current user ---
def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception
    return user

# --- Profile endpoint ---
@api_router.get("/profile", response_model=UserRead)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserRead.model_validate(current_user)

# --- Update profile endpoint ---
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

@api_router.put("/profile", response_model=UserRead)
def update_profile(update: UserUpdate, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    updated = False
    if update.username and update.username != current_user.username:
        current_user.username = update.username
        updated = True
    if update.email and update.email != current_user.email:
        current_user.email = update.email
        updated = True
    if update.password:
        current_user.hashed_password = pwd_context.hash(update.password)
        updated = True
    if updated:
        session.add(current_user)
        session.commit()
        session.refresh(current_user)
    return UserRead.model_validate(current_user)

# --- Delete account endpoint ---
@api_router.delete("/profile")
def delete_profile(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    session.delete(current_user)
    session.commit()
    return {"detail": "Account deleted"}

class UserRead(BaseModel):
    id: int
    username: str
    email: str
    created_at: str  # Accept both datetime and str for compatibility

    @classmethod
    def model_validate(cls, user):
        # Accept both SQLModel and dict
        if isinstance(user, dict):
            data = user
        else:
            data = user.dict() if hasattr(user, 'dict') else dict(user)
        # Convert created_at to isoformat if it's a datetime
        ca = data.get('created_at')
        if hasattr(ca, 'isoformat'):
            data['created_at'] = ca.isoformat()
        return cls(**data)

# --- Portfolio Model ---
class Portfolio(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None

# --- Project Model ---
class Project(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    portfolio_id: int
    description: str | None = None

# --- Section Model ---
class Section(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    project_id: int
    description: str | None = None

# --- Priority Model ---
class Priority(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None

# --- Portfolio CRUD ---
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

security = HTTPBasic()

VALID_USERNAME = "jakub"
VALID_PASSWORD = "cerulik123"

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, VALID_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, VALID_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@api_router.post("/api/portfolios", response_model=Portfolio)
def create_portfolio(portfolio: Portfolio, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(portfolio)
    session.commit()
    session.refresh(portfolio)
    return portfolio

@api_router.get("/api/portfolios", response_model=List[Portfolio])
def list_portfolios(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Portfolio)).all()

# --- Project CRUD ---
@api_router.post("/api/projects", response_model=Project)
def create_project(project: Project, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@api_router.get("/api/projects", response_model=List[Project])
def list_projects(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Project)).all()

# --- Section CRUD ---
@api_router.post("/api/sections", response_model=Section)
def create_section(section: Section, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(section)
    session.commit()
    session.refresh(section)
    return section

@api_router.get("/api/sections", response_model=List[Section])
def list_sections(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Section)).all()

# --- Priority CRUD ---
@api_router.post("/api/priorities", response_model=Priority)
def create_priority(priority: Priority, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    session.add(priority)
    session.commit()
    session.refresh(priority)
    return priority

@api_router.get("/api/priorities", response_model=List[Priority])
def list_priorities(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    return session.exec(select(Priority)).all()

# --- Task CRUD ---
from models import Task  # Use canonical Task model only

@api_router.post("/api/tasks")
def create_task(task: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    logger.debug(f"POST /api/tasks called with payload: {task}")
    try:
        # Patch 'description' to 'task_comments' if present
        if "description" in task:
            task["task_comments"] = task["description"]
        # Convert string date fields to Python date/datetime objects
        from datetime import date, datetime
        for date_field in ["due_date", "start_date", "completed_at", "created_at", "last_modified_at"]:
            if date_field in task and isinstance(task[date_field], str):
                try:
                    if len(task[date_field]) == 10:
                        task[date_field] = date.fromisoformat(task[date_field])
                    else:
                        task[date_field] = datetime.fromisoformat(task[date_field])
                except Exception as e:
                    logger.error(f"Failed to parse date for field {date_field}: {task[date_field]}: {e}")
        db_task = Task(**task)
        session.add(db_task)
        session.commit()
        session.refresh(db_task)
        data = db_task.dict()
        data["id"] = data.get("task_id", db_task.task_id)
        if "task_comments" in data:
            data["description"] = data["task_comments"]
        for k, v in data.items():
            if hasattr(v, "isoformat"):
                data[k] = v.isoformat()
        logger.debug(f"POST /api/tasks response: {data}")
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Exception in POST /api/tasks: {e}\n{traceback.format_exc()}")
        raise

@api_router.get("/api/tasks")
def get_tasks(
    portfolio_id: int = Query(None),
    project_id: int = Query(None),
    section_id: int = Query(None),
    priority_id: int = Query(None),
    due_date: str = Query(None),
    completed_at: str = Query(None),
    session: Session = Depends(get_session),
    user: str = Depends(get_current_user)
):
    query = session.query(Task)
    filters = {}
    if portfolio_id is not None:
        query = query.filter(Task.portfolio_id == str(portfolio_id))
    if project_id is not None:
        query = query.filter(Task.project_id == str(project_id))
    if section_id is not None:
        query = query.filter(Task.section_id == str(section_id))
    if priority_id is not None:
        query = query.filter(Task.priority_id == str(priority_id))
    if due_date is not None:
        from datetime import date
        query = query.filter(Task.due_date == date.fromisoformat(due_date))
    if completed_at is not None:
        from datetime import date
        query = query.filter(Task.completed_at == date.fromisoformat(completed_at))
    tasks = query.all()
    results = []
    for task in tasks:
        data = task.dict()
        data["id"] = data.get("task_id", None)
        # Patch in 'description' as alias for 'task_comments' for compatibility
        if "task_comments" in data:
            data["description"] = data["task_comments"]
        for k, v in data.items():
            if hasattr(v, "isoformat"):
                data[k] = v.isoformat()
        results.append(data)
    return JSONResponse(content=results)

@api_router.get("/api/tasks/{task_id}")
def get_task(task_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        return JSONResponse(status_code=404, content={"detail": "Task not found"})
    data = task.dict()
    data["id"] = data.get("task_id", task_id)
    # Convert all datetime/date fields to isoformat for JSON serialization
    for k, v in data.items():
        if hasattr(v, "isoformat"):
            data[k] = v.isoformat()
    # Patch in 'description' as alias for 'task_comments' for legacy/test compatibility
    if "task_comments" in data:
        data["description"] = data["task_comments"]
    return JSONResponse(content=data)

@api_router.put("/api/tasks/{task_id}")
def update_task(task_id: int, update: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import Task  # Ensure Task is always imported in local scope
    logger.debug(f"PUT /api/tasks/{task_id} called with update: {update}")
    try:
        task = session.get(Task, task_id)
        if not task:
            logger.warning(f"Task {task_id} not found for update.")
            return JSONResponse(status_code=404, content={"detail": "Task not found"})
        # Special handling: if 'description' is in update, map it to 'task_comments'
        if "description" in update:
            update["task_comments"] = update["description"]
        update = sanitize_task_update(update)
        logger.debug(f"Sanitized update dict: {update}")
        for k, v in update.items():
            logger.debug(f"Setting attribute {k} to {v} (type: {type(v)}) on Task {task_id}")
            if hasattr(task, k):
                try:
                    setattr(task, k, v)
                except Exception as e:
                    logger.error(f"Failed to set attribute {k} to {v} (type: {type(v)}) on Task {task_id}: {e}")
                    raise
        # FINAL ENFORCEMENT: ensure all string fields are strings before commit
        import typing
        model_fields = Task.model_fields if hasattr(Task, 'model_fields') else Task.__fields__
        for field_name, field_info in model_fields.items():
            field_type = getattr(field_info, 'annotation', None) or getattr(field_info, 'type_', None)
            origin = typing.get_origin(field_type)
            args = typing.get_args(field_type)
            if origin is typing.Union and len(args) == 2 and type(None) in args:
                real_type = args[0] if args[1] is type(None) else args[1]
            else:
                real_type = field_type
            if real_type is str:
                current_val = getattr(task, field_name)
                if not isinstance(current_val, str):
                    setattr(task, field_name, "")
        logger.debug(f"Final task state before commit: {task.dict()}")
        import datetime
        task.last_modified_at = datetime.datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        data = task.dict()
        data["id"] = data.get("task_id", task_id)
        if "task_comments" in data:
            data["description"] = data["task_comments"]
        # Convert all datetime/date fields to isoformat for JSON serialization
        for k, v in data.items():
            if hasattr(v, "isoformat"):
                data[k] = v.isoformat()
        logger.debug(f"PUT /api/tasks/{task_id} response: {data}")
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Exception in PUT /api/tasks/{task_id}: {e}\n{traceback.format_exc()}")
        raise

@api_router.patch("/api/tasks/{task_id}")
def patch_task(task_id: int, update: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    logger.debug(f"PATCH /api/tasks/{task_id} called with update: {update}")
    try:
        task = session.get(Task, task_id)
        if not task:
            logger.warning(f"Task {task_id} not found for patch.")
            return JSONResponse(status_code=404, content={"detail": "Task not found"})
        # Patch 'description' to 'task_comments' if present
        if "description" in update:
            update["task_comments"] = update["description"]
        update = sanitize_task_update(update)
        logger.debug(f"Sanitized update dict: {update}")
        for k, v in update.items():
            logger.debug(f"Setting attribute {k} to {v} (type: {type(v)}) on Task {task_id}")
            if hasattr(task, k):
                try:
                    setattr(task, k, v)
                except Exception as e:
                    logger.error(f"Failed to set attribute {k} to {v} (type: {type(v)}) on Task {task_id}: {e}")
                    raise
        # FINAL ENFORCEMENT: ensure all string fields are strings before commit
        from models import Task
        import typing
        model_fields = Task.model_fields if hasattr(Task, 'model_fields') else Task.__fields__
        for field_name, field_info in model_fields.items():
            field_type = getattr(field_info, 'annotation', None) or getattr(field_info, 'type_', None)
            origin = typing.get_origin(field_type)
            args = typing.get_args(field_type)
            if origin is typing.Union and len(args) == 2 and type(None) in args:
                real_type = args[0] if args[1] is type(None) else args[1]
            else:
                real_type = field_type
            if real_type is str:
                current_val = getattr(task, field_name)
                if not isinstance(current_val, str):
                    setattr(task, field_name, "")
        logger.debug(f"Final task state before commit: {task.dict()}")
        import datetime as dt
        task.last_modified_at = dt.datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        data = task.dict()
        data["id"] = data.get("task_id", task_id)
        if "task_comments" in data:
            data["description"] = data["task_comments"]
        for k, v in data.items():
            if hasattr(v, "isoformat"):
                data[k] = v.isoformat()
        logger.debug(f"PATCH /api/tasks/{task_id} response: {data}")
        return JSONResponse(content=data)
    except Exception as e:
        logger.error(f"Exception in PATCH /api/tasks/{task_id}: {e}\n{traceback.format_exc()}")
        raise

# --- Helper to robustly sanitize all Task update fields (using SQLModel field types) ---
def sanitize_task_update(update: dict):
    from datetime import date, datetime
    from models import Task
    import typing
    model_fields = Task.model_fields if hasattr(Task, 'model_fields') else Task.__fields__  # SQLModel >=0.0.8 or Pydantic v1
    for k, v in list(update.items()):
        if k not in model_fields:
            continue
        field_info = model_fields[k]
        # Get the real type, unwrapping Optional/Union
        field_type = getattr(field_info, 'annotation', None) or getattr(field_info, 'type_', None)
        origin = typing.get_origin(field_type)
        args = typing.get_args(field_type)
        if origin is typing.Union and len(args) == 2 and type(None) in args:
            # Optional[X] -> get X
            real_type = args[0] if args[1] is type(None) else args[1]
        else:
            real_type = field_type
        # Sanitize date/datetime fields
        if real_type in [date, datetime]:
            if v in (None, "", [], {}):
                update[k] = None
            elif isinstance(v, str):
                try:
                    if len(v) == 10:
                        update[k] = date.fromisoformat(v)
                    else:
                        update[k] = datetime.fromisoformat(v)
                except Exception:
                    update[k] = None
        # Sanitize string fields (force to empty string if not a string)
        elif real_type is str:
            if not isinstance(v, str):
                update[k] = ""
        # Sanitize int/float fields (convert ""/[]/{} to None)
        elif real_type in [int, float]:
            if v in ("", [], {}):
                update[k] = None
        # Sanitize bool fields (convert localized strings to bool, or set to None)
        elif real_type is bool:
            if v in ("", [], {}, None):
                update[k] = None
            elif isinstance(v, str):
                true_vals = {"true", "yes", "1", "áno", "ano", "y", "t"}
                false_vals = {"false", "no", "0", "nie", "n", "f"}
                v_lower = v.strip().lower()
                if v_lower in true_vals:
                    update[k] = True
                elif v_lower in false_vals:
                    update[k] = False
                else:
                    update[k] = None
            elif isinstance(v, (int, float)):
                update[k] = bool(v)
            elif isinstance(v, bool):
                pass  # already correct
            else:
                update[k] = None
        # Fallback: if value is [] or {}, set to None
        elif isinstance(v, (list, dict)):
            update[k] = None
    return update

@api_router.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    task = session.get(Task, task_id)
    if not task:
        return JSONResponse(status_code=404, content={"detail": "Task not found"})
    session.delete(task)
    session.commit()
    return JSONResponse(status_code=204, content=None)

import csv
from fastapi.responses import StreamingResponse
from io import StringIO

@api_router.get("/api/tasks/export/csv")
def export_tasks_csv(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    tasks = session.exec(select(Task)).all()
    output = StringIO()
    fieldnames = list(Task.__fields__.keys())
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for t in tasks:
        writer.writerow(t.dict())
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=tasks.csv"})

@api_router.post("/api/tasks/import/csv")
def import_tasks_csv(file: UploadFile = File(...), session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    import csv
    from io import StringIO
    from datetime import datetime, date
    content = file.file.read().decode()
    reader = csv.DictReader(StringIO(content))
    imported = 0
    for row in reader:
        row.pop("id", None)
        # Remove PK if present or empty, to avoid unique constraint errors
        if "task_id" in row:
            if not row["task_id"] or str(row["task_id"]).strip() == "":
                row.pop("task_id")
            else:
                # If task_id is present, skip this row (avoid duplicate PK)
                continue
        row = {k: v for k, v in row.items() if k}
        # Convert date/datetime fields from string to Python objects if needed
        for field in ["created_at", "completed_at", "last_modified_at", "due_date", "start_date"]:
            if field in row:
                if not row[field] or str(row[field]).strip() == "":
                    row[field] = None
                else:
                    try:
                        if field.endswith("_at"):
                            row[field] = datetime.fromisoformat(row[field])
                        else:
                            row[field] = date.fromisoformat(row[field])
                    except Exception:
                        row[field] = None
        for field in ["allow_autonomous_execution"]:
            if field in row:
                if row[field] in (None, "", "null"): row[field] = None
                elif str(row[field]).lower() in ("true", "1"): row[field] = True
                elif str(row[field]).lower() in ("false", "0"): row[field] = False
                else: row[field] = None
        for field in ["number_of_variations"]:
            if field in row:
                if row[field] in (None, "", "null"): row[field] = None
                else:
                    try: row[field] = int(row[field])
                    except Exception: row[field] = None
        task = Task(**row)
        session.add(task)
        imported += 1
    session.commit()
    return {"imported": imported}

# --- Dashboard endpoint ---
@api_router.get("/api/dashboard")
def dashboard(session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    total_tasks = session.exec(select(Task)).count()
    completed_tasks = session.exec(select(Task).where(Task.completed_at != None)).count()
    open_tasks = session.exec(select(Task).where(Task.completed_at == None)).count()
    # Tasks due in next 7 days
    now = datetime.utcnow()
    in_7_days = now + timedelta(days=7)
    upcoming_due_7d = session.exec(
        select(Task).where(Task.due_date != None, Task.due_date >= now.date(), Task.due_date <= in_7_days.date())
    ).count()
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "open_tasks": open_tasks,
        "upcoming_due_7d": upcoming_due_7d
    }

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@api_router.post("/api/chat")
def chat_endpoint(request: ChatRequest, user: str = Depends(get_current_user)):
    # Dummy AI reply for MVP/testing
    return {"response": f"AI says: {request.message}"}

# Utility: always add 'id' field to all single-object POST endpoints
@api_router.post("/api/desired-output-formats")
def create_desired_output_format(item: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import DesiredOutputFormat
    db_item = DesiredOutputFormat(**item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    data = db_item.dict()
    data["id"] = getattr(db_item, "id", getattr(db_item, "desired_output_format_id", None))
    return JSONResponse(content=data)

@api_router.post("/api/ai-action-process-dropdown")
def create_ai_action_process_dropdown(item: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import AIActionProcessDropdown
    db_item = AIActionProcessDropdown(**item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    data = db_item.dict()
    data["id"] = getattr(db_item, "id", getattr(db_item, "ai_action_process_dropdown_id", None))
    return JSONResponse(content=data)

@api_router.post("/api/ai-workflow-statuses")
def create_ai_workflow_status(item: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import AIWorkflowStatus
    db_item = AIWorkflowStatus(**item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    data = db_item.dict()
    data["id"] = getattr(db_item, "id", getattr(db_item, "ai_workflow_status_id", None))
    return JSONResponse(content=data)

@api_router.post("/api/desired-style-tones")
def create_desired_style_tone(item: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import DesiredStyleTone
    db_item = DesiredStyleTone(**item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    data = db_item.dict()
    data["id"] = getattr(db_item, "id", getattr(db_item, "desired_style_tone_id", None))
    return JSONResponse(content=data)

@api_router.post("/api/ai-behavior-on-uncertainties")
def create_ai_behavior_on_uncertainty(item: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import AIBehaviorOnUncertainty
    db_item = AIBehaviorOnUncertainty(**item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    data = db_item.dict()
    data["id"] = getattr(db_item, "id", getattr(db_item, "ai_behavior_on_uncertainty_id", None))
    return JSONResponse(content=data)

@api_router.post("/api/ai-creativity-levels")
def create_ai_creativity_level(item: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import AICreativityLevel
    db_item = AICreativityLevel(**item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    data = db_item.dict()
    data["id"] = getattr(db_item, "id", getattr(db_item, "ai_creativity_level_id", None))
    return JSONResponse(content=data)

@api_router.post("/api/ai-processing-priorities")
def create_ai_processing_priority(item: dict, session: Session = Depends(get_session), user: str = Depends(get_current_user)):
    from models import AIProcessingPriority
    db_item = AIProcessingPriority(**item)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    data = db_item.dict()
    data["id"] = getattr(db_item, "id", getattr(db_item, "ai_processing_priority_id", None))
    return JSONResponse(content=data)

app.include_router(api_router)
