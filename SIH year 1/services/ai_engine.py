import os
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

CLASSIFICATION_SYSTEM_PROMPT = """You are an AI assistant for a Civic Grievance Redressal system.
Analyze the user's civic grievance input and extract structured information into a JSON object.

Output MUST contain the following keys:
- "summary": A clear, concise English description of the EXACT core civic problem/issue reported (e.g. "Hazardous deep pothole on MG Road near Trinity Metro Station", "Burst sewage pipeline flooding street").
- "extracted_location": Street names, landmarks, pin codes, or locations mentioned. If none found, return "Not specified".
- "urgency": Categorize urgency into exactly one of: "Low", "Medium", "High", "Critical".
- "department": Categorize into exactly one of the following exact options:
    - "Roads & Infrastructure"
    - "Water Supply & Sewage"
    - "Electricity & Public Lighting"
    - "Waste Management & Sanitation"
    - "Public Health"

Return strictly a valid JSON object matching this schema.
"""

ALLOWED_DEPARTMENTS = [
    "Roads & Infrastructure",
    "Water Supply & Sewage",
    "Electricity & Public Lighting",
    "Waste Management & Sanitation",
    "Public Health"
]

ALLOWED_URGENCIES = ["Low", "Medium", "High", "Critical"]

def get_groq_client() -> Groq:
    """Initialize and return the Groq SDK client."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here" or api_key.startswith("gsk_your"):
        raise ValueError("GROQ_API_KEY environment variable is not configured with a valid API key.")
    return Groq(api_key=api_key)

def transcribe_with_gemini(audio_file_path: str) -> str:
    """
    Uses Google Gemini API (gemini-1.5-flash / gemini-2.0-flash) to convert regional language audio
    (Hindi, Kannada, Tamil, Telugu, Marathi, English, etc.) into English text transcription.
    """
    import base64
    import httpx
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key or not gemini_key.strip() or gemini_key.strip() == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY environment variable is not configured in .env file.")

    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file does not exist: {audio_file_path}")

    ext = os.path.splitext(audio_file_path)[1].lower()
    mime_type = "audio/mp3" if ext in [".mp3", ".mpeg"] else "audio/webm" if ext == ".webm" else "audio/wav" if ext == ".wav" else "audio/mp3"

    with open(audio_file_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Transcribe and translate this civic grievance voice recording into clear English text. Output ONLY the raw transcribed English text without any additional conversational prefixes, explanations, or quotes."
                    },
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": audio_b64
                        }
                    }
                ]
            }
        ]
    }

    models_to_try = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-2.0-flash-exp"]
    res = None
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key.strip()}"
        try:
            res = httpx.post(url, json=payload, timeout=30.0)
            if res.status_code == 200:
                break
        except Exception:
            continue

    if res and res.status_code == 200:
        res_data = res.json()
        candidates = res_data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts and parts[0].get("text"):
                return parts[0]["text"].strip()
                
    raise RuntimeError(f"Gemini API returned status {res.status_code if res else 'No Response'}: {res.text if res else ''}")

def transcribe_and_translate_audio(audio_file_path: str) -> str:
    """
    Transcribes and translates audio to English using Gemini API, falling back to Groq Whisper if needed.
    
    Args:
        audio_file_path (str): Path to the regional language audio file.
        
    Returns:
        str: English translated transcription.
    """
    if not os.path.exists(audio_file_path):
        raise FileNotFoundError(f"Audio file does not exist: {audio_file_path}")

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and gemini_key.strip() and gemini_key.strip() != "your_gemini_api_key_here":
        try:
            print(f"[INFO] Transcribing audio via Gemini API ({os.path.basename(audio_file_path)})...")
            return transcribe_with_gemini(audio_file_path)
        except Exception as err:
            print(f"[WARN] Gemini API audio transcription failed ({err}). Switching to Groq Whisper fallback.")
            
    client = get_groq_client()
    with open(audio_file_path, "rb") as file:
        transcription = client.audio.translations.create(
            file=(os.path.basename(audio_file_path), file.read()),
            model="whisper-large-v3-turbo",
            response_format="json"
        )
        
    return transcription.text

def classify_with_gemini(text: str) -> dict:
    """
    Uses Google Gemini API to parse English grievance text into structured JSON:
    summary, extracted_location, urgency, and department.
    """
    import httpx
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key or not gemini_key.strip() or gemini_key.strip() == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY environment variable is not configured in .env file.")

    prompt = f"""{CLASSIFICATION_SYSTEM_PROMPT}

Grievance Text:
{text}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }

    models_to_try = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-2.0-flash-exp"]
    res = None
    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key.strip()}"
        try:
            res = httpx.post(url, json=payload, timeout=30.0)
            if res.status_code == 200:
                break
        except Exception:
            continue

    if res and res.status_code == 200:
        res_data = res.json()
        candidates = res_data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts and parts[0].get("text"):
                return json.loads(parts[0]["text"])

    raise RuntimeError(f"Gemini API returned status {res.status_code}: {res.text}")

def classify_grievance(text: str) -> dict:
    """
    Parses grievance text into structured fields (summary, department, urgency, extracted_location).
    Uses Gemini API if configured, with Groq LLM as fallback.
    """
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")

    parsed_json = None

    # Primary: Try Gemini API
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and gemini_key.strip() and gemini_key.strip() != "your_gemini_api_key_here":
        try:
            print("[INFO] Classifying grievance via Gemini API...")
            parsed_json = classify_with_gemini(text)
        except Exception as err:
            print(f"[WARN] Gemini classification failed ({err}). Using Groq LLM fallback.")

    # Fallback: Groq LLM
    if not parsed_json:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": CLASSIFICATION_SYSTEM_PROMPT},
                {"role": "user", "content": f"Grievance Text:\n{text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = response.choices[0].message.content
        parsed_json = json.loads(content)
    
    # Validation & Fallbacks
    if "summary" not in parsed_json or not parsed_json["summary"]:
        parsed_json["summary"] = text[:100] + "..." if len(text) > 100 else text
        
    if "extracted_location" not in parsed_json:
        parsed_json["extracted_location"] = "Not specified"
        
    if parsed_json.get("urgency") not in ALLOWED_URGENCIES:
        parsed_json["urgency"] = "Medium"
        
    if parsed_json.get("department") not in ALLOWED_DEPARTMENTS:
        # Fallback keyword matching if LLM selected slightly variant text
        dept = parsed_json.get("department", "")
        if "road" in dept.lower() or "pothole" in dept.lower():
            parsed_json["department"] = "Roads & Infrastructure"
        elif "water" in dept.lower() or "sewage" in dept.lower() or "drain" in dept.lower():
            parsed_json["department"] = "Water Supply & Sewage"
        elif "electric" in dept.lower() or "light" in dept.lower() or "power" in dept.lower():
            parsed_json["department"] = "Electricity & Public Lighting"
        elif "waste" in dept.lower() or "garbage" in dept.lower() or "sanitation" in dept.lower():
            parsed_json["department"] = "Waste Management & Sanitation"
        else:
            parsed_json["department"] = "Public Health"
            
    return parsed_json
