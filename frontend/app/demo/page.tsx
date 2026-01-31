"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, GraduationCap, FileText, CheckCircle2, Lock, MapPin, 
  Loader2, Sparkles, Search, MessageSquare, Send, X, ChevronDown, ChevronUp, Mail, Phone,
  AlertTriangle, ThumbsUp
} from 'lucide-react';

const API_BASE_URL = "http://localhost:8000"; 
const DEMO_USER_ID = 1;

// --- HARDCODED TASKS (Guarantees they never disappear) ---
const DEMO_TASKS = [
    { 
        id: 101, 
        title: "Draft Statement of Purpose (SOP)", 
        category: "Documents", 
        status: "pending", 
        steps: ["Brainstorm your 'Why'", "Write Introduction", "Explain Academic Background", "Proofread & Edit"] 
    },
    { 
        id: 102, 
        title: "Request Letters of Recommendation", 
        category: "Documents", 
        status: "pending", 
        steps: ["Identify 2 Professors", "Send Formal Email", "Share Resume", "Follow up"] 
    },
    { 
        id: 103, 
        title: "Book IELTS/TOEFL Exam", 
        category: "Exams", 
        status: "pending", 
        steps: ["Register on Website", "Select Date", "Pay Fee", "Download Admit Card"] 
    },
    { 
        id: 104, 
        title: "Prepare Financial Documents", 
        category: "Finance", 
        status: "pending", 
        steps: ["Calculate Total Cost", "Get Bank Solvency Certificate", "Get Affidavit of Support"] 
    },
    { 
        id: 105, 
        title: "Submit Online Application", 
        category: "Application", 
        status: "pending", 
        steps: ["Create Portal Account", "Upload Documents", "Pay App Fee", "Submit"] 
    }
];

export default function PremiumDemoPage() {
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stage, setStage] = useState("onboarding");
  
  const [universities, setUniversities] = useState<any>(null);
  const [allUniversities, setAllUniversities] = useState<any[]>([]);
  const [lockedUni, setLockedUni] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [confirmModal, setConfirmModal] = useState<{show: boolean, uni: any | null}>({show: false, uni: null});

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([
      {role: 'bot', text: "Hi! I'm your AI Counsellor."}
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const safeKey = (prefix: string, id: any, index: number) => `${prefix}-${id || 'no-id'}-${index}`;
  const getChanceValue = (s: string) => { const m = s?.match(/\d+/); return m ? parseInt(m[0]) : 50; };

  const calculateProgress = () => {
    let total = 0, completed = 0;
    tasks.forEach((t, i) => {
        if(t.steps && t.steps.length > 0) {
            t.steps.forEach((_: any, sIdx: number) => {
                total++;
                if(checkedSteps[`${t.id || i}-${sIdx}`]) completed++;
            });
        } else {
            total++;
            if(t.status === 'completed') completed++;
        }
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/${DEMO_USER_ID}`)
      .then(res => res.json())
      .then(data => {
         if(data.stage === 'locked') {
             setLockedUni(data.locked_university);
             // If backend has tasks, use them. If not, use DEMO_TASKS.
             setTasks(data.tasks && data.tasks.length > 0 ? data.tasks : DEMO_TASKS);
             setStage('locked');
         } else if (data.stage === 'shortlist') {
             setUniversities(data.shortlisted_universities);
             setStage('shortlist');
         } else if (data.stage === 'profile') setStage('profile');
      })
      .catch(() => console.log("New Session"));

    fetch(`${API_BASE_URL}/universities/all`)
      .then(res => res.json())
      .then(data => setAllUniversities(data))
      .catch(e => console.log("Search error", e));
  }, []);

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const profile = {
        name: formData.get("name"),
        gpa: formData.get("gpa"),
        budget: formData.get("budget"),
        target_country: formData.get("country")
    };
    setUserProfile(profile);
    fetch(`${API_BASE_URL}/onboarding/${DEMO_USER_ID}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
    });
    setStage("profile"); 
  };

  const handleGenerateShortlist = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/universities/shortlist/${DEMO_USER_ID}`, { method: "POST" });
    const data = await res.json();
    setUniversities(data);
    setStage("shortlist");
    setLoading(false);
  };

  const initiateLock = (uni: any) => setConfirmModal({show: true, uni});

  const confirmLock = async () => {
    if (!confirmModal.uni) return;
    const uni = confirmModal.uni;
    setLoading(true);
    setConfirmModal({show: false, uni: null});

    // 1. UPDATE UI INSTANTLY (The "Fix")
    setLockedUni(uni);
    setTasks(DEMO_TASKS); 
    setStage("locked");
    
    // 2. SYNC BACKEND (Fire & Forget)
    fetch(`${API_BASE_URL}/universities/lock`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: DEMO_USER_ID, university_name: uni.name }),
    }).then(() => {
        fetch(`${API_BASE_URL}/tasks/generate/${DEMO_USER_ID}`, { method: "POST" });
    });

    setLoading(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputMsg.trim()) return;
    const newMsgs = [...messages, {role: 'user' as const, text: inputMsg}];
    setMessages(newMsgs);
    setInputMsg("");
    const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message: inputMsg})
    });
    const data = await res.json();
    setMessages([...newMsgs, {role: 'bot', text: data.reply}]);
  };

  const toggleStep = (taskId: any, stepIdx: number) => {
      const key = `${taskId}-${stepIdx}`;
      setCheckedSteps(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const TaskList = () => (
      <div className="space-y-3">
        {tasks.map((task: any, i: number) => (
            <div key={safeKey('task', task.id, i)} className="border rounded-lg overflow-hidden transition-all duration-200">
                <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedTask(expandedTask === i ? null : i)}>
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {task.status === 'completed' && <div className="h-3 w-3 bg-green-500 rounded-full"/>}
                    </div>
                    <div className="flex-1 font-medium">{task.title}</div>
                    <div className="text-xs text-gray-500 uppercase mr-2">{task.category}</div>
                    {expandedTask === i ? <ChevronUp className="h-4 w-4 text-gray-400"/> : <ChevronDown className="h-4 w-4 text-gray-400"/>}
                </div>
                {expandedTask === i && (
                    <div className="bg-gray-50 p-4 border-t text-sm space-y-2 pl-4 animate-in slide-in-from-top-1">
                        {task.steps && task.steps.length > 0 ? task.steps.map((step: string, sIdx: number) => (
                            <div key={safeKey('step', task.id, sIdx)} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleStep(task.id || i, sIdx)}>
                                <div className={`h-4 w-4 border rounded ${checkedSteps[`${task.id || i}-${sIdx}`] ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                    {checkedSteps[`${task.id || i}-${sIdx}`] && <CheckCircle2 className="h-3 w-3 text-white" />}
                                </div>
                                <span className={checkedSteps[`${task.id || i}-${sIdx}`] ? "line-through text-gray-400" : ""}>{step}</span>
                            </div>
                        )) : <p className="text-gray-400">No specific sub-steps.</p>}
                    </div>
                )}
            </div>
        ))}
      </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans text-slate-900">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white shadow-sm hidden md:flex flex-col">
        <div className="flex h-16 items-center border-b px-6 text-blue-600 font-bold text-xl gap-2">
            <GraduationCap /> Navigator.ai
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <button onClick={() => setActiveView('dashboard')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><LayoutDashboard className="h-5 w-5"/> Dashboard</button>
          <button onClick={() => setActiveView('search')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeView === 'search' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><Search className="h-5 w-5"/> University Search</button>
          <button onClick={() => setActiveView('applications')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeView === 'applications' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><FileText className="h-5 w-5"/> Applications</button>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 transition-all duration-300 p-8">
        
        {/* MODAL */}
        {confirmModal.show && confirmModal.uni && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center">
                    {getChanceValue(confirmModal.uni.chance) < 30 ? (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4"><AlertTriangle className="h-8 w-8 text-amber-600" /></div>
                    ) : (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4"><ThumbsUp className="h-8 w-8 text-green-600" /></div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{getChanceValue(confirmModal.uni.chance) < 30 ? "High Risk Application" : "Great Match!"}</h3>
                    <p className="text-gray-600 mb-6">{getChanceValue(confirmModal.uni.chance) < 30 ? `Chance: ${confirmModal.uni.chance}. Are you sure?` : `Chance: ${confirmModal.uni.chance}. Lock this choice?`}</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmModal({show: false, uni: null})} className="flex-1 border py-2 rounded-lg">Cancel</button>
                        <button onClick={confirmLock} className={`flex-1 text-white py-2 rounded-lg font-bold ${getChanceValue(confirmModal.uni.chance) < 30 ? 'bg-amber-600' : 'bg-green-600'}`}>{loading ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Lock"}</button>
                    </div>
                </div>
            </div>
        )}

        {/* DASHBOARD */}
        {activeView === 'dashboard' && (
            <div>
                <h1 className="text-2xl font-bold mb-6">{stage === 'onboarding' ? 'Start Your Journey' : `Welcome Back`}</h1>

                {stage === 'onboarding' && (
                    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border">
                        <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                            <h2 className="text-xl font-bold mb-4">Create Your Profile</h2>
                            <input name="name" required placeholder="Full Name" className="w-full border p-2 rounded" />
                            <input name="gpa" required placeholder="GPA (e.g. 3.8)" className="w-full border p-2 rounded" />
                            <input name="budget" required placeholder="Budget (e.g. $40k)" className="w-full border p-2 rounded" />
                            <select name="country" className="w-full border p-2 rounded">
                                <option>United States</option> <option>United Kingdom</option> <option>Canada</option> <option>Germany</option>
                            </select>
                            <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Start Planning</button>
                        </form>
                    </div>
                )}

                {stage === 'profile' && (
                    <div className="text-center py-20">
                        <h2 className="text-3xl font-bold mb-4">Profile Analysis Complete</h2>
                        <button onClick={handleGenerateShortlist} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 mx-auto">{loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Generate Shortlist</button>
                    </div>
                )}

                {stage === 'shortlist' && universities && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['dream', 'target', 'safe'].map((cat) => (
                            <div key={cat} className={`p-4 rounded-xl border ${cat === 'dream' ? 'bg-amber-50' : cat === 'target' ? 'bg-blue-50' : 'bg-green-50'}`}>
                                <h3 className="font-bold mb-4 text-center capitalize">{cat}</h3>
                                {universities[cat].map((u: any, i: number) => (
                                    <div key={safeKey(cat, u.id, i)} className="bg-white p-4 rounded-lg shadow-sm border mb-3 hover:shadow-md transition cursor-pointer hover:scale-105 duration-200" onClick={() => initiateLock(u)}>
                                        <div className="font-bold">{u.name}</div>
                                        <div className="text-xs text-gray-500 mb-2">{u.location}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium bg-gray-100 px-1 rounded">{u.chance}</span>
                                            <button className="bg-gray-900 text-white text-xs px-2 py-1 rounded">Lock</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {(stage === 'locked' || stage === 'application') && lockedUni && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <div className="text-sm font-bold text-blue-600 uppercase">Target Locked</div>
                                <h2 className="text-3xl font-bold">{lockedUni.name}</h2>
                                <p className="text-gray-500 flex items-center gap-2"><MapPin className="h-4 w-4"/> {lockedUni.location}</p>
                            </div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                                <div className="flex items-center gap-2"><Mail className="h-3 w-3"/> {lockedUni.email || "admissions@uni.edu"}</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Application Progress</h3>
                                <span className="text-blue-600 font-bold">{calculateProgress()}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{width: `${calculateProgress()}%`}}></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Your Checklist</h3>
                            <TaskList />
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* SEARCH */}
        {activeView === 'search' && (
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">University Search</h2>
                {allUniversities.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allUniversities.map((u:any, i:number) => (
                          <div key={safeKey('search', u.id, i)} className="bg-white p-4 rounded-xl border flex justify-between items-center hover:shadow-md transition">
                              <div>
                                  <div className="font-bold">{u.name}</div>
                                  <div className="text-sm text-gray-500">{u.location}</div>
                              </div>
                              <button onClick={() => initiateLock(u)} className="text-blue-600 text-xs font-bold hover:underline">Select</button>
                          </div>
                      ))}
                   </div>
                ) : <div className="text-center py-20 text-gray-400"><Loader2 className="h-8 w-8 animate-spin mx-auto"/> Loading...</div>}
            </div>
        )}

        {/* APPLICATIONS (NOW WITH TASKS) */}
        {activeView === 'applications' && (
            <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">My Applications</h2>
                {lockedUni ? (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">{lockedUni.name[0]}</div>
                                <div>
                                    <h3 className="font-bold text-lg">{lockedUni.name}</h3>
                                    <div className="text-sm text-gray-500">Status: <span className="text-orange-500 font-medium">In Progress</span></div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${calculateProgress()}%`}}></div>
                            </div>
                            <p className="text-xs text-right text-gray-500">{calculateProgress()}% Complete</p>
                        </div>
                        {/* REUSED TASK LIST HERE */}
                        <div className="bg-white p-6 rounded-2xl border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Application Checklist</h3>
                            <TaskList />
                        </div>
                    </div>
                ) : <div className="text-center py-20 text-gray-400">No active applications.</div>}
            </div>
        )}
      </main>

      {/* CHATBOT */}
      <div className="fixed bottom-6 right-6 z-50">
          {!chatOpen && <button onClick={() => setChatOpen(true)} className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition"><MessageSquare className="h-6 w-6"/></button>}
          {chatOpen && (
              <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
                  <div className="bg-blue-600 text-white p-4 flex justify-between items-center"><span className="font-bold">AI Counsellor</span><button onClick={() => setChatOpen(false)}><X className="h-4 w-4" /></button></div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                      {messages.map((m, i) => (
                          <div key={i} className={`p-2 rounded-lg text-sm max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-white border text-gray-800'}`}>{m.text}</div>
                      ))}
                  </div>
                  <form onSubmit={handleChat} className="p-2 border-t flex gap-2 bg-white">
                      <input value={inputMsg} onChange={e => setInputMsg(e.target.value)} placeholder="Ask anything..." className="flex-1 text-sm outline-none" />
                      <button type="submit" className="text-blue-600"><Send className="h-4 w-4" /></button>
                  </form>
              </div>
          )}
      </div>
    </div>
  );
}