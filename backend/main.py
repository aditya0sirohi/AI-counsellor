import os, json, re, requests
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import User, Profile, UniversityShortlist, LockedUniversity, Task

load_dotenv()
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"status":"ok"}

# ---------------- SIGNUP ----------------

@app.post("/signup")
def signup(name:str,email:str,db:Session=Depends(get_db)):
    user = User(name=name,email=email,onboarding_complete=False)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ---------------- ONBOARD ----------------

@app.post("/onboarding/{user_id}")
def onboard(user_id:int,data:dict=Body(...),db:Session=Depends(get_db)):
    profile = Profile(user_id=user_id,stage="discover",**data)
    db.add(profile)

    user = db.query(User).filter(User.id==user_id).first()
    if user:
        setattr(user,"onboarding_complete",True)

    db.commit()
    return {"ok":True}

# ---------------- DASHBOARD ----------------

@app.get("/dashboard/{user_id}")
def dashboard(user_id:int,db:Session=Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id==user_id).first()
    shortlist = db.query(UniversityShortlist).filter(UniversityShortlist.user_id==user_id).all()
    locked = db.query(LockedUniversity).filter(LockedUniversity.user_id==user_id).first()
    tasks = db.query(Task).filter(Task.user_id==user_id).all()

    return {
        "stage": profile.stage if profile else "discover",
        "shortlist":[{"name":s.name,"category":s.category} for s in shortlist],
        "locked": locked.name if locked else None,
        "tasks":[{"title":t.title} for t in tasks]
    }

# ---------------- GET UNIVERSITIES ----------------

@app.get("/universities/{user_id}")
def get_unis(user_id:int,db:Session=Depends(get_db)):
    return db.query(UniversityShortlist).filter(UniversityShortlist.user_id==user_id).all()

# ---------------- SHORTLIST ----------------

@app.post("/universities/shortlist/{user_id}")
def shortlist(user_id:int,db:Session=Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id==user_id).first()
    if not profile:
        return {"error":"no profile"}

    prompt=f"""
Return JSON only:

{{"dream":["A"],"target":["B"],"safe":["C"]}}
"""

    headers={"Authorization":f"Bearer {OPENROUTER_KEY}","Content-Type":"application/json"}

    payload={
        "model":"meta-llama/llama-3-8b-instruct",
        "messages":[{"role":"user","content":prompt}]
    }

    r=requests.post("https://openrouter.ai/api/v1/chat/completions",headers=headers,json=payload)
    content=r.json()["choices"][0]["message"]["content"]

    match=re.search(r"\{.*\}",content,re.S)
    raw=match.group()

    try:
        data=json.loads(raw)
    except:
        data=json.loads(json.loads(f'"{raw}"'))

    db.query(UniversityShortlist).filter(UniversityShortlist.user_id==user_id).delete()

    for k in ["dream","target","safe"]:
        for u in data[k]:
            db.add(UniversityShortlist(user_id=user_id,name=u,category=k))

    setattr(profile,"stage","finalize")
    db.commit()

    return {"ok":True}

# ---------------- LOCK ----------------

@app.post("/universities/lock")
def lock(user_id:int=Body(...),university:str=Body(...),db:Session=Depends(get_db)):
    profile=db.query(Profile).filter(Profile.user_id==user_id).first()
    if not profile:
        return {"error":"no profile"}

    db.add(LockedUniversity(user_id=user_id,name=university))
    setattr(profile,"stage","apply")
    db.commit()

    return {"locked":university}

# ---------------- TASKS ----------------

@app.post("/tasks/generate/{user_id}")
def tasks(user_id:int,db:Session=Depends(get_db)):
    locked=db.query(LockedUniversity).filter(LockedUniversity.user_id==user_id).first()
    if not locked:
        return {"error":"lock first"}

    prompt="""
Return JSON:

[
{"title":"Write SOP"},
{"title":"Prepare IELTS"},
{"title":"Collect LORs"},
{"title":"Submit application"},
{"title":"Upload CV"},
{"title":"Interview"}
]
"""

    headers={"Authorization":f"Bearer {OPENROUTER_KEY}","Content-Type":"application/json"}

    payload={
        "model":"meta-llama/llama-3-8b-instruct",
        "messages":[{"role":"user","content":prompt}]
    }

    r=requests.post("https://openrouter.ai/api/v1/chat/completions",headers=headers,json=payload)
    content=r.json()["choices"][0]["message"]["content"]

    match=re.search(r"\[.*\]",content,re.S)
    raw=match.group()

    try:
        tasks=json.loads(raw)
    except:
        tasks=json.loads(json.loads(f'"{raw}"'))

    for t in tasks:
        db.add(Task(user_id=user_id,title=t["title"]))

    db.commit()
    return {"tasks":tasks}
