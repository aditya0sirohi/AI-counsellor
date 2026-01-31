import os, json, random, requests
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import User, Profile, UniversityShortlist, LockedUniversity, Task

# --- INIT ---
load_dotenv()
Base.metadata.create_all(bind=engine)
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY") 

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 1. ROBUST UNIVERSAL TASKS (Always Works) ---
UNIVERSAL_TASKS = [
    {"title": "Draft Statement of Purpose (SOP)", "category": "Documents", "steps": "Brainstorm your 'Why'|Write Introduction (Hook)|Explain Academic Background|Explain Career Goals|Proofread & Edit"},
    {"title": "Request Letters of Recommendation", "category": "Documents", "steps": "Identify 2 Professors|Identify 1 Employer (Optional)|Send Formal Request Email|Share Resume with Recommenders|Follow up 2 weeks before deadline"},
    {"title": "Book Language Exam (IELTS/TOEFL)", "category": "Exams", "steps": "Create Account on Official Website|Select Test Date & Center|Pay Exam Fee|Download Admit Card|Start Practice Tests"},
    {"title": "Prepare Financial Documents", "category": "Finance", "steps": "Calculate Total Cost (Tuition + Living)|Request Bank Solvency Certificate|Get Affidavit of Support from Parents|Scan & Save as PDF"},
    {"title": "Submit Online Application", "category": "Application", "steps": "Create University Portal Account|Fill Personal Details|Upload SOP, LORs, & CV|Pay Application Fee|Submit & Download Receipt"}
]

# --- 2. COUNTRY DATA ---
COUNTRY_DATA = {
    "United States": {
        "dream": [{"name": "Stanford University", "location": "California, USA", "chance": "Low (12%)", "email": "admission@stanford.edu"}, {"name": "MIT", "location": "Massachusetts, USA", "chance": "Low (8%)", "email": "admissions@mit.edu"}],
        "target": [{"name": "Georgia Tech", "location": "Atlanta, USA", "chance": "Medium (45%)", "email": "admission@gatech.edu"}, {"name": "Purdue University", "location": "Indiana, USA", "chance": "Medium (50%)", "email": "intladmissions@purdue.edu"}],
        "safe": [{"name": "Arizona State", "location": "Phoenix, USA", "chance": "High (85%)", "email": "international@asu.edu"}, {"name": "Univ. of Florida", "location": "Gainesville, USA", "chance": "High (82%)", "email": "freshman@ufl.edu"}]
    },
    "United Kingdom": {
        "dream": [{"name": "Imperial College London", "location": "London, UK", "chance": "Low (15%)", "email": "admissions@imperial.ac.uk"}, {"name": "Univ. of Oxford", "location": "Oxford, UK", "chance": "Low (10%)", "email": "undergraduate.admissions@admin.ox.ac.uk"}],
        "target": [{"name": "Univ. of Manchester", "location": "Manchester, UK", "chance": "Medium (55%)", "email": "international@manchester.ac.uk"}, {"name": "King's College London", "location": "London, UK", "chance": "Medium (50%)", "email": "newstudents@kcl.ac.uk"}],
        "safe": [{"name": "Univ. of Leeds", "location": "Leeds, UK", "chance": "High (80%)", "email": "study@leeds.ac.uk"}, {"name": "Univ. of Birmingham", "location": "Birmingham, UK", "chance": "High (85%)", "email": "admissions@bham.ac.uk"}]
    },
    # Fallback/Default for others
    "Default": {
        "dream": [{"name": "Univ. of Toronto", "location": "Toronto, Canada", "chance": "Low (20%)", "email": "recruit.artsci@utoronto.ca"}, {"name": "UBC", "location": "Vancouver, Canada", "chance": "Low (25%)", "email": "international.admissions@ubc.ca"}],
        "target": [{"name": "Univ. of Waterloo", "location": "Waterloo, Canada", "chance": "Medium (60%)", "email": "myapp@uwaterloo.ca"}, {"name": "McGill University", "location": "Montreal, Canada", "chance": "Medium (55%)", "email": "admissions@mcgill.ca"}],
        "safe": [{"name": "Univ. of Alberta", "location": "Edmonton, Canada", "chance": "High (85%)", "email": "welcome@ualberta.ca"}, {"name": "Univ. of Ottawa", "location": "Ottawa, Canada", "chance": "High (88%)", "email": "liaison@uottawa.ca"}]
    }
}

# --- API ENDPOINTS ---

@app.get("/")
def root(): return {"status": "AI Counsellor Online"}

@app.get("/universities/all")
def get_all_universities():
    all_unis = []
    for country, cats in COUNTRY_DATA.items():
        for cat, unis in cats.items():
            for u in unis:
                u_copy = u.copy()
                u_copy['country'] = country
                all_unis.append(u_copy)
    return all_unis

@app.post("/onboarding/{user_id}")
def onboard(user_id: int, body: dict = Body(...), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)
    
    profile.education = "Undergrad"
    profile.gpa = body.get("gpa", "N/A")
    profile.budget = body.get("budget", "N/A")
    profile.target_country = body.get("target_country", "United States")
    profile.stage = "profile"
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, name=body.get("name", "Student"), email=f"user{user_id}@example.com", onboarding_complete=True)
        db.add(user)
    
    db.commit()
    return {"status": "success"}

@app.get("/dashboard/{user_id}")
def dashboard(user_id:int, db:Session=Depends(get_db)):
    locked = db.query(LockedUniversity).filter(LockedUniversity.user_id==user_id).first()
    tasks = db.query(Task).filter(Task.user_id==user_id).all()
    
    if locked:
        # Find uni details
        uni_details = {"name": locked.name, "location": "Campus", "chance": "Secured", "email": "admissions@uni.edu"}
        for country, cats in COUNTRY_DATA.items():
            for cat, unis in cats.items():
                for u in unis:
                    if u["name"] == locked.name: uni_details = u

        return {
            "stage": "locked",
            "locked_university": uni_details,
            "tasks": [{"id": t.id, "title": t.title, "status": t.status, "category": t.category, "steps": t.steps.split('|') if t.steps else []} for t in tasks]
        }

    shortlist = db.query(UniversityShortlist).filter(UniversityShortlist.user_id==user_id).all()
    if shortlist:
        return {
            "stage": "shortlist",
            "shortlisted_universities": {
                "dream": [{"id": s.id, "name": s.name, "location": s.location, "chance": s.chance} for s in shortlist if s.category == "dream"],
                "target": [{"id": s.id, "name": s.name, "location": s.location, "chance": s.chance} for s in shortlist if s.category == "target"],
                "safe": [{"id": s.id, "name": s.name, "location": s.location, "chance": s.chance} for s in shortlist if s.category == "safe"]
            }
        }

    profile = db.query(Profile).filter(Profile.user_id==user_id).first()
    return {"stage": "profile" if profile else "onboarding"}

@app.post("/universities/shortlist/{user_id}")
def shortlist(user_id:int, db:Session=Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id==user_id).first()
    country = str(profile.target_country) if profile and profile.target_country else "United States"
    
    # Fallback to "Default" if country not found exactly
    data = COUNTRY_DATA.get(country, COUNTRY_DATA["Default"]) 

    db.query(UniversityShortlist).filter(UniversityShortlist.user_id==user_id).delete()
    for cat in ["dream", "target", "safe"]:
        for u in data.get(cat, []):
            db.add(UniversityShortlist(user_id=user_id, name=u['name'], category=cat, location=u['location'], chance=u['chance']))

    db.commit()
    return data

@app.post("/universities/lock")
def lock(body:dict=Body(...), db:Session=Depends(get_db)):
    user_id = body.get("user_id")
    uni_name = body.get("university_name")
    db.query(LockedUniversity).filter(LockedUniversity.user_id==user_id).delete()
    db.add(LockedUniversity(user_id=user_id, name=uni_name))
    db.commit()
    return {"status": "locked"}

@app.post("/tasks/generate/{user_id}")
def generate_tasks(user_id:int, db:Session=Depends(get_db)):
    # ALWAYS generate the UNIVERSAL TASKS (Fixed list)
    db.query(Task).filter(Task.user_id==user_id).delete()
    
    created_tasks = []
    for t in UNIVERSAL_TASKS:
        new_task = Task(
            user_id=user_id, 
            title=t["title"], 
            category=t["category"], 
            status="pending",
            steps=t["steps"]
        )
        db.add(new_task)
        created_tasks.append(new_task)

    db.commit()
    return created_tasks

# --- CHATBOT ---
@app.post("/chat")
def chat(body:dict=Body(...)):
    msg = body.get("message", "")
    if not msg: return {"reply": "Please ask a question."}
    
    if not OPENROUTER_KEY:
        # Fallback if no API Key
        return {"reply": "I can help with Visas, SOPs, and Admissions. (Add API Key for real AI)."}

    try:
        headers={"Authorization":f"Bearer {OPENROUTER_KEY}","Content-Type":"application/json"}
        payload={"model":"meta-llama/llama-3-8b-instruct:free","messages":[{"role":"user","content":f"Short answer for study abroad student: {msg}"}]}
        r=requests.post("https://openrouter.ai/api/v1/chat/completions",headers=headers,json=payload, timeout=5)
        if r.status_code == 200:
            return {"reply": r.json()["choices"][0]["message"]["content"]}
    except:
        pass
    
    return {"reply": "I'm experiencing high traffic. Please ask about 'Visa' or 'SOP' specifically."}