
# 🎓 Navigator.ai

> **The Stage-Based AI Agent for Study Abroad Success.**
> *From Confusion to Commitment to Campus.*

*(Replace this link with a screenshot of your Dashboard)*

## 🚀 The Problem

Study abroad planning is broken. Students are overwhelmed by generic Google searches, expensive agents, and unstructured data. Most AI tools are just "chatbots" that dump text without guiding action.

## 💡 The Solution

**Navigator.ai** is an **Agentic Workflow System**. Instead of just answering questions, it enforces a structured decision pipeline:

1. **Profile Analysis** (GPA, Budget, Preferences)
2. **Smart Discovery** (Dream / Target / Safe Sorting)
3. **Commitment Protocol** (The "Lock" Mechanism)
4. **Execution Roadmap** (Country-specific automated checklists)

## ✨ Key Features

### 1. 🧠 Context-Aware Shortlisting

The AI analyzes student credentials against database constraints to categorize universities into **Dream**, **Target**, and **Safe** buckets across major destinations (USA, UK, Canada, Germany).

### 2. 🔒 The "Lock" Mechanism

To prevent analysis paralysis, users must **"Lock"** a target university. This psychological commitment trigger unlocks the specific execution layer for that university.

### 3. 📝 Deep-Task Execution Pipelines

We don't just say "Get a Visa." We generate actionable, country-specific sub-tasks:

* **USA:** Pay SEVIS Fee → DS-160 → F1 Interview.
* **UK:** CAS Number → ATAS Certificate → Tier 4 Appointment.

### 4. 💬 AI Counsellor Chatbot

A persistent AI assistant (powered by Llama 3) that sits on the dashboard to answer ad-hoc queries about SOPs, loans, and scholarships with context-aware responses.

---

## 🛠️ Tech Stack

**Frontend**

* **Next.js 14** (App Router)
* **Tailwind CSS** (Modern "Loveable" UI Design)
* **Lucide React** (Iconography)

**Backend**

* **FastAPI** (High-performance Python API)
* **SQLAlchemy + SQLite** (Relational Data Persistence)
* **OpenRouter** (Llama 3 AI Integration)

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (v18+)
* Python (v3.9+)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Server
uvicorn main:app --reload

```

*The Backend will start at `http://localhost:8000*`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the Client
npm run dev

```

*The Frontend will start at `http://localhost:3000*`

### 3. Environment Variables

Create a `.env` file in the `backend` folder:

```env
OPENROUTER_API_KEY=your_api_key_here

```

*(Note: The system has a Smart Fallback mode, so it works perfectly for demos even without an API key!)*

---

## 📸 Screen Previews

| **Smart Dashboard** | **University Shortlisting** |
| --- | --- |
| *(Place Screenshot Here)* | *(Place Screenshot Here)* |
| **Visual Progress Tracking** | **Task Breakdown** |

---

## 🏆 Hackathon Notes

* **Demo Reliability:** We implemented a "Universal Task Fallback" system to ensure the demo **never crashes** during presentation, regardless of API latency.
* **Mock Data:** For the purpose of the hackathon, we use a hybrid of Real AI calls and curated university datasets to ensure speed and accuracy.

---

## 🤝 Contributor

* **Aditya Sirohi** - Full Stack Developer

* DEMO_LINK_LIVE : https://ai-counsellor-orcin.vercel.app/

---

### License

MIT
