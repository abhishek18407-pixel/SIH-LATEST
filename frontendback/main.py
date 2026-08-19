import os
import sys
import shutil
import tempfile
import base64
import json
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx

# Load environment variables
load_dotenv()

app = FastAPI(title="Civic Grievance - AI Redressal Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
    "te": "Telugu",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ml": "Malayalam",
    "or": "Odia",
    "as": "Assamese",
    "ur": "Urdu",
}

CLASSIFICATION_SYSTEM_PROMPT = """You are an AI assistant for a Civic Grievance Redressal system.
Analyze the user's civic grievance input and extract structured information into a JSON object.

Output MUST contain the following keys:
- "summary": A clear, concise English description of the EXACT core civic problem/issue reported (e.g. "Hazardous deep pothole on MG Road near Trinity Metro Station", "Burst sewage pipeline flooding street", "Streetlight broken on 4th Cross").
- "extracted_location": Street names, landmarks, pin codes, or locations mentioned. If none found, return "Not specified".
- "urgency": Categorize urgency into exactly one of: "Low", "Medium", "High", "Critical".
- "department": Categorize into exactly one of:
    - "Roads & Infrastructure (PWD)"
    - "Water Supply"
    - "Sewage & Drainage"
    - "Electricity / Street Lighting"
    - "Sanitation & Waste Management"
    - "Public Health"
    - "Parks, Gardens & Environment"
    - "Traffic & Transport"
    - "General Administration"

Return strictly a valid JSON object matching this schema.
"""

def is_valid_gemini_key(key: Optional[str]) -> bool:
    return bool(key and key.strip() and (key.strip().startswith("AIzaSy") or len(key.strip()) > 20))

def transcribe_with_groq(tmp_path: str) -> str:
    from groq import Groq
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key.startswith("gsk_your"):
        raise ValueError("GROQ_API_KEY is not configured.")
    client = Groq(api_key=api_key)
    with open(tmp_path, "rb") as file:
        transcription = client.audio.translations.create(
            file=(os.path.basename(tmp_path), file.read()),
            model="whisper-large-v3-turbo",
            response_format="json"
        )
    return transcription.text

def classify_text(text: str) -> dict:
    """Extracts summary, department, and urgency from grievance text using LLM."""
    groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192", "gemma2-9b-it"]
    for g_model in groq_models:
        try:
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY")
            if api_key and not api_key.startswith("gsk_your"):
                client = Groq(api_key=api_key)
                response = client.chat.completions.create(
                    model=g_model,
                    messages=[
                        {"role": "system", "content": CLASSIFICATION_SYSTEM_PROMPT},
                        {"role": "user", "content": f"Grievance Text:\n{text}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1
                )
                parsed = json.loads(response.choices[0].message.content)
                if "summary" in parsed and parsed["summary"]:
                    return parsed
        except Exception:
            continue

    # Fallback smart keyword-based categorization
    text_lower = text.lower()
    dept = "General Administration"
    severity = "Medium"
    if any(k in text_lower for k in ["pothole", "road", "footpath", "pavement", "bridge", "street"]):
        dept = "Roads & Infrastructure (PWD)"
        severity = "High"
    elif any(k in text_lower for k in ["drain", "sewage", "manhole", "overflow"]):
        dept = "Sewage & Drainage"
        severity = "High"
    elif any(k in text_lower for k in ["water", "leak", "pipeline", "tap"]):
        dept = "Water Supply"
        severity = "High"
    elif any(k in text_lower for k in ["garbage", "trash", "waste", "dump", "dustbin", "smell"]):
        dept = "Sanitation & Waste Management"
        severity = "Medium"
    elif any(k in text_lower for k in ["light", "streetlight", "electric", "power", "wire"]):
        dept = "Electricity / Street Lighting"
        severity = "Medium"
    elif any(k in text_lower for k in ["mosquito", "dengue", "disease", "health", "hospital"]):
        dept = "Public Health"
        severity = "High"

    return {
        "summary": text[:120] + "..." if len(text) > 120 else text,
        "department": dept,
        "urgency": severity,
        "extracted_location": "Not specified"
    }

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "Civic Grievance AI Backend",
        "groq_configured": bool(os.getenv("GROQ_API_KEY") and not os.getenv("GROQ_API_KEY").startswith("gsk_your"))
    }

@app.post("/analyze")
async def analyze_grievance(text: str = Form(...)):
    """Extracts summary, department, and severity from grievance text."""
    classification = classify_text(text)
    return {
        "success": True,
        "summary": classification.get("summary", text),
        "department": classification.get("department", "Roads & Infrastructure (PWD)"),
        "severity": classification.get("urgency", "Medium"),
        "extracted_location": classification.get("extracted_location", "Not specified")
    }

@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form(default=None),
):
    """Audio transcription endpoint using Groq Whisper."""
    suffix = os.path.splitext(file.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    lang_arg = (language or "hi").split("-")[0].lower()

    try:
        text_res = transcribe_with_groq(tmp_path)
        classification = classify_text(text_res)
        return {
            "success": True,
            "detected_language_code": lang_arg,
            "detected_language_name": LANGUAGE_NAMES.get(lang_arg, lang_arg),
            "original_text": text_res,
            "english_text": text_res,
            "summary": classification.get("summary", text_res),
            "department": classification.get("department", "Roads & Infrastructure (PWD)"),
            "severity": classification.get("urgency", "Medium"),
            "location": classification.get("extracted_location", "Not specified")
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)