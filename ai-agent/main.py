# Setup FastAPI backend for SukoonAI Agent
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import PlainTextResponse
from xml.etree.ElementTree import Element, tostring
import uvicorn
import os
import traceback

from ai_agent import graph, SYSTEM_PROMPT, parse_response
from tools import query_medgemma

app = FastAPI(title="SukoonAI Backend Agent")

# --------------------------------------------------
# ✅ CORS Configuration (Next.js Integration)
# --------------------------------------------------
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Health Check Route
# --------------------------------------------------
@app.get("/")
def health_check():
    return {"status": "ok", "message": "SukoonAI agent backend is running"}

# --------------------------------------------------
# Request Model
# --------------------------------------------------
class Query(BaseModel):
    message: str

# --------------------------------------------------
# Web Chat Route (Next.js -> FastAPI)
# --------------------------------------------------
@app.post("/ask")
async def ask(query: Query):
    try:
        print("USER MESSAGE:", query.message)

        if graph is not None:
            inputs = {
                "messages": [
                    ("system", SYSTEM_PROMPT),
                    ("user", query.message),
                ]
            }
            stream = graph.stream(inputs, stream_mode="updates")
            tool_called_name, final_response = parse_response(stream)

            if final_response:
                return {
                    "response": final_response,
                    "tool_called": tool_called_name,
                }

        # Fallback to query_medgemma
        resp = query_medgemma(query.message)
        return {
            "response": resp,
            "tool_called": "ask_mental_health_specialist",
        }

    except Exception as e:
        print("BACKEND ERROR:")
        traceback.print_exc()
        fallback_resp = query_medgemma(query.message)
        return {
            "response": fallback_resp,
            "tool_called": "None",
        }


# --------------------------------------------------
# Twilio WhatsApp Helpers
# --------------------------------------------------
def _twiml_message(body: str) -> PlainTextResponse:
    """
    Create minimal TwiML:
    <Response>
        <Message>...</Message>
    </Response>
    """
    response_el = Element("Response")
    message_el = Element("Message")
    message_el.text = body
    response_el.append(message_el)

    xml_bytes = tostring(response_el, encoding="utf-8")
    return PlainTextResponse(content=xml_bytes, media_type="application/xml")

# --------------------------------------------------
# WhatsApp Route (Twilio → FastAPI)
# --------------------------------------------------
@app.post("/whatsapp_ask")
async def whatsapp_ask(Body: str = Form(...)):
    try:
        user_text = Body.strip() if Body else ""

        if graph is not None:
            inputs = {
                "messages": [
                    ("system", SYSTEM_PROMPT),
                    ("user", user_text)
                ]
            }
            stream = graph.stream(inputs, stream_mode="updates")
            tool_called_name, final_response = parse_response(stream)
            if final_response:
                return _twiml_message(final_response)

        fallback_resp = query_medgemma(user_text)
        return _twiml_message(fallback_resp)

    except Exception:
        return _twiml_message(
            "I'm here for you, but something went wrong. Please try again."
        )


# --------------------------------------------------
# Run Server
# --------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
