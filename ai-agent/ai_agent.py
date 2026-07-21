# Setup AI Agent logic and tools
from langchain_core.tools import tool
from tools import query_medgemma, call_emergency
import googlemaps
import re
from config import GOOGLE_MAPS_API_KEY, GROQ_API_KEY
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent

@tool
def ask_mental_health_specialist(query: str) -> str:
    """
    Generate a therapeutic response using the Groq clinical psychologist model.
    Use this for emotional concerns, mental health questions, or to offer empathetic guidance.
    """
    return query_medgemma(query)


@tool
def emergency_call_tool() -> None:
    """
    Place an emergency call to the safety helpline's phone number via Twilio.
    Use this only if the user expresses suicidal ideation, intent to self-harm,
    or describes a mental health emergency requiring immediate help.
    """
    call_emergency()


gmaps = None
if GOOGLE_MAPS_API_KEY:
    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
    except Exception as e:
        print(f"[WARNING] Google Maps init failed: {e}")


@tool
def find_nearby_therapists_by_location(location: str) -> str:
    """
    Finds real therapists near the specified location using Google Maps API.
    
    Args:
        location (str): The city or area to search.
    
    Returns:
        str: A list of therapist names, addresses, and phone numbers.
    """
    if not gmaps:
        return f"Google Maps API key is not configured. Unable to search therapists near {location} automatically."
    try:
        geocode_result = gmaps.geocode(location)
        if not geocode_result:
            return f"Could not find coordinates for {location}."
        lat_lng = geocode_result[0]['geometry']['location']
        lat, lng = lat_lng['lat'], lat_lng['lng']
        places_result = gmaps.places_nearby(
            location=(lat, lng),
            radius=5000,
            keyword="Psychotherapist"
        )
        output = [f"Therapists near {location}:"]
        top_results = places_result.get('results', [])[:5]
        for place in top_results:
            name = place.get("name", "Unknown")
            address = place.get("vicinity", "Address not available")
            details = gmaps.place(place_id=place["place_id"], fields=["formatted_phone_number"])
            phone = details.get("result", {}).get("formatted_phone_number", "Phone not available")

            output.append(f"- {name} | {address} | {phone}")

        return "\n".join(output)
    except Exception as e:
        return f"Error finding therapists near {location}: {str(e)}"


tools = [ask_mental_health_specialist, emergency_call_tool, find_nearby_therapists_by_location]

graph = None
if GROQ_API_KEY:
    try:
        # Ultra-fast Groq model (llama-3.1-8b-instant) for sub-second responses
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.6,
            max_tokens=600,
            groq_api_key=GROQ_API_KEY
        )
        graph = create_react_agent(llm, tools=tools)
    except Exception as e:
        print(f"[WARNING] Failed to initialize Groq LLM: {e}")


SYSTEM_PROMPT = """You are Dr. Emily Hartman, a warm, empathetic clinical psychologist.

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
- Use available tools when appropriate (`emergency_call_tool` for self-harm/suicidal crisis, `find_nearby_therapists_by_location` for location queries).
"""


def _clean_streamlit_style(text: str) -> str:
    """
    Clean up extra blank lines while preserving markdown formatting (bolding, headings, bullet points).
    """
    if not text:
        return text

    # Remove excessive blank lines (more than 2)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def parse_response(stream):
    tool_called_name = "None"
    final_response = None

    for s in stream:
        # 1️⃣ Capture tool calls
        tool_data = s.get("tools")
        if tool_data:
            tool_messages = tool_data.get("messages")
            if isinstance(tool_messages, list):
                for msg in tool_messages:
                    tool_called_name = getattr(msg, "name", tool_called_name)

        # 2️⃣ Capture agent message
        agent_data = s.get("agent")
        if agent_data:
            messages = agent_data.get("messages")
            if isinstance(messages, list):
                for msg in messages:
                    if getattr(msg, "content", None):
                        final_response = msg.content

    # 3️⃣ Enforce clean response formatting
    final_response = _clean_streamlit_style(final_response)

    return tool_called_name, final_response
