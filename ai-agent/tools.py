# Tools and LLM queries for SukoonAI Agent
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from twilio.rest import Client
from config import GROQ_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, EMERGENCY_CONTACT

THERAPIST_SYSTEM_PROMPT = """You are Dr. Emily Hartman, a warm, empathetic clinical psychologist.

You MUST respond strictly in English using the following concise, bulleted format:

📌 **[Short Topic Title]**
[A brief 1-2 sentence empathetic introductory overview.]

🔹 **Key Guidance & Concepts**
- **[Key Point 1]**: [Short 1-sentence explanation]
- **[Key Point 2]**: [Short 1-sentence explanation]
- **[Key Point 3]**: [Short 1-sentence explanation]

💡 **Practical Action / Tip**
[A 1-2 sentence actionable exercise or real-life tip.]

How are you feeling about this, or is there anything specific you'd like to explore next? 😊

Key Instructions:
- Keep responses short, precise, and structured.
- Always use simple bullet points with bold lead-ins for key points.
- Respond ONLY in English.
"""

def query_medgemma(prompt: str) -> str:
    """
    Calls Groq model with Dr. Emily Hartman's therapist personality profile.
    Returns responses as an empathic mental health professional.
    """
    if not GROQ_API_KEY:
        return (
            "I hear you, and I want you to know your feelings matter deeply. "
            "GROQ_API_KEY is not configured in .env. How can I best support you today?"
        )
    try:
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.6,
            max_tokens=600,
            groq_api_key=GROQ_API_KEY
        )
        response = llm.invoke([
            SystemMessage(content=THERAPIST_SYSTEM_PROMPT),
            HumanMessage(content=prompt)
        ])
        return response.content.strip()
    except Exception as e:
        print(f"Groq query error: {e}")
        return (
            "I hear you, and I want you to know your feelings matter deeply. "
            "How can I best support you today?"
        )


def call_emergency():
    """
    Triggers emergency hotline call via Twilio API.
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print("[WARNING] Twilio credentials missing from .env. Emergency call simulated.")
        return
    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        call = client.calls.create(
            to=EMERGENCY_CONTACT or "+1234567890",
            from_=TWILIO_FROM_NUMBER or "+1234567890",
            url="http://demo.twilio.com/docs/voice.xml"
        )
    except Exception as e:
        print(f"Error placing emergency call: {e}")
