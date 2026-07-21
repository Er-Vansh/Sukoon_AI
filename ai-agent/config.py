import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# ---- API KEYS ----
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")
EMERGENCY_CONTACT = os.getenv("EMERGENCY_CONTACT")

# ---- VALIDATION (NON-FATAL WARNINGS) ----
if not GROQ_API_KEY:
    print("[WARNING] GROQ_API_KEY is missing from .env")

if not GOOGLE_MAPS_API_KEY:
    print("[WARNING] GOOGLE_MAPS_API_KEY is missing from .env")
