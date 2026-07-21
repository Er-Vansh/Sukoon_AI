# SukoonAI - Mental Health & Therapy Platform

SukoonAI is a fullstack AI-powered mental health platform featuring an empathetic clinical psychologist AI agent, therapist discovery, crisis hotline integration, and community support.

---

## Project Structure

```
SukoonAI/
├── ai-agent/               # Python FastAPI Backend & LangChain/LangGraph AI Agent
│   ├── main.py             # FastAPI App Server (/ask, /whatsapp_ask)
│   ├── ai_agent.py         # LangGraph ReAct Agent setup (llama-3.1-8b-instant)
│   ├── tools.py            # Clinical guidance, Twilio SOS, Google Maps tools
│   ├── config.py           # Environment configurations
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── README.md           # Backend documentation & deployment guide
├── app/                    # Next.js App Router (Pages, API Routes)
├── components/             # UI Components (AI Chat Interface, Widget, SOS, etc.)
├── lib/                    # Supabase client & utilities
├── public/                 # Static assets
├── package.json            # Node.js dependencies
└── README.md
```

---

## Getting Started

### 1. Start the Next.js Frontend
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
The frontend will run on [http://localhost:3000](http://localhost:3000).

### 2. Start the AI Agent Backend
In a separate terminal window:
```bash
cd ai-agent

# Install python dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```
The backend agent server will run on [http://localhost:8000](http://localhost:8000).

---

## Environment Variables

### Frontend (`.env`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_AI_AGENT_URL=http://localhost:8000
```

### Backend (`ai-agent/.env`)
```env
GROQ_API_KEY=your_groq_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=your_twilio_number
EMERGENCY_CONTACT=your_emergency_contact
FRONTEND_URL=http://localhost:3000
```

---

## Deployment Guide

- **Frontend (Next.js)**: Deploy to [Vercel](https://vercel.com) by connecting your GitHub repository `SukoonAI`. Set `NEXT_PUBLIC_AI_AGENT_URL` to your live backend service URL.
- **Backend (`ai-agent`)**: Deploy to [Render](https://render.com), [Railway](https://railway.app), or [Modal](https://modal.com). Set root directory to `ai-agent`, build command to `pip install -r requirements.txt`, and start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.
