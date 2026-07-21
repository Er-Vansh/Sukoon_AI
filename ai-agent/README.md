# SukoonAI - AI Agent Backend

This directory contains the Python FastAPI backend and LangChain/LangGraph agent for **SukoonAI**.

## Architecture & Features
- **FastAPI Framework**: Exposes REST endpoints (`/ask`, `/whatsapp_ask`) for Next.js frontend and Twilio WhatsApp integration.
- **LangChain / LangGraph ReAct Agent**: Employs Dr. Emily Hartman's clinical psychologist persona using `llama-3.1-8b-instant` on Groq for sub-second responses.
- **Tools**:
  - `ask_mental_health_specialist`: Direct clinical psychological guidance.
  - `find_nearby_therapists_by_location`: Google Maps integration for local therapist discovery.
  - `emergency_call_tool`: Automated Twilio crisis helpline call trigger.

---

## Local Setup & Development

### 1. Install Dependencies
Ensure Python 3.10+ is installed.
```bash
# Create virtual environment (optional)
python -m venv venv
# Activate on Windows:
.\venv\Scripts\activate
# Activate on macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

### 3. Run Backend Server
```bash
python main.py
```
The server will start on `http://localhost:8000`.

---

## Deployment Instructions

### Deploying to Render / Railway / Modal / AWS

1. Set **Build Command**: `pip install -r requirements.txt`
2. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Configure Environment Variables (`GROQ_API_KEY`, `FRONTEND_URL`, etc.) in your hosting service dashboard.
4. Update `NEXT_PUBLIC_AI_AGENT_URL` in your Next.js frontend `.env` to point to the deployed backend URL.
