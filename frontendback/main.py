import os
import sys
import shutil
import tempfile
import base64
import json
import urllib.parse
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

CLASSIFICATION_SYSTEM_PROMPT = """You are an AI assistant for a Civic Grievance Redressal system in India.
Analyze the user's civic grievance input which may be in any Indian regional language (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, etc.) or English.

Perform TWO tasks:
1. Translate the core problem into a clear, concise English description for "summary".
2. Categorize the issue into the correct municipal department.

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
    - "Animal Control (Stray Animals)"
    - "Public Toilets"
    - "General Administration"

Return strictly a valid JSON object matching this schema.
"""

MULTILINGUAL_RULES = [
    {
        "dept": "Roads & Infrastructure (PWD)",
        "template": "Hazardous pothole and road infrastructure damage reported",
        "severity": "High",
        "keywords": [
            "pothole", "potholes", "road", "roads", "footpath", "pavement", "bridge", "crack", "tar", "asphalt", "crater", "speed breaker", "broken road",
            "गड्ढा", "गड्ढे", "सड़क", "रास्ता", "फुटपाथ", "पुल", "मार्ग", "रोड", "डामर", "टूटी सड़क", "खराब सड़क", "गड्ढा है", "सड़क",
            "குழி", "குழிகள்", "சாலை", "நடைபாதை", "பாலம்", "தெரு", "தார்", "பழுது",
            "గుంత", "గుంతలు", "రోడ్డు", "రహదారి", "ఫుట్‌పాత్", "వంతెన", "వీధి", "పాడైన రోడ్డు",
            "ಗುಂಡಿ", "ಗುಂಡಿಗಳು", "ರಸ್ತೆ", "ಕಾಲುದಾರಿ", "ಸೇತುವೆ", "ಬೀದಿ", "ಹಾಳಾದ ರಸ್ತೆ", "ತಗ್ಗು",
            "खड्डा", "खड्डे", "रस्ता", "पदपथ", "पूल", "गल्ली", "डांबरी", "रस्ता खराब",
            "গর্ত", "রাস্তা", "ফুটপাত", "সেতু", "সড়ক", "ভাঙা রাস্তা",
            "ખાડો", "ખાડા", "રસ્તો", "પુલ", "ગલી", "ફૂટપાથ", "તૂટેલો રસ્તો",
            "കുഴി", "കുഴികൾ", "റോഡ്", "നടപ്പാത", "പാലം", "തെരുവ്",
            "ਖੱਡਾ", "ਖੱਡੇ", "ਸੜਕ", "ਰਸਤਾ", "ਪੁਲ", "ਫੁੱਟਪਾਥ",
            "ଖାଲ", "ରାସ୍ତା", "ଫୁଟପାଥ", "ପୋଲ",
            "گڑھا", "گڑھے", "سڑک", "راستہ", "پل", "فٹ پاتھ"
        ]
    },
    {
        "dept": "Water Supply",
        "template": "Water supply disruption, low pressure, or pipeline leakage",
        "severity": "High",
        "keywords": [
            "water", "tap", "pipeline", "pipe leak", "pipe burst", "drinking water", "water supply", "no water", "water shortage", "tank", "motor", "borewell",
            "पानी", "नल", "पाइपलाइन", "लीकेज", "पीने का पानी", "जल", "जल आपूर्ति", "पानी नहीं", "पानी की समस्या", "टंकी", "पाइप फट",
            "தண்ணீர்", "குழாய்", "கசிவு", "குடிநீர்", "தண்ணீர் இல்லை", "நீர் விநியோகம்",
            "నీరు", "నీళ్లు", "నల్లా", "పైప్‌లైన్", "లీకేజీ", "తాగునీరు", "నీటి కొరత", "నీటి సరఫరా",
            "ನೀರು", "ನಲ್ಲಿ", "ಪೈಪ್‌ಲೈನ್", "ಸೋರಿಕೆ", "ಕುಡಿಯುವ ನೀರು", "ನೀರಿಲ್ಲ", "ನೀರಿನ ಕೊರತೆ",
            "पाणी", "नळ", "पाईपलाईन", "गळती", "पिण्याचे पाणी", "पाणी नाही", "पाणी टंचाई",
            "জল", "নল", "পাইপলাইন", "ফুটো", "পানীয় জল", "জল নেই",
            "પાણી", "નળ", "પાઇપલાઇન", "લીકેજ", "પીવાનું પાણી", "પાણી નથી",
            "വെള്ളം", "പൈപ്പ്", "ചോർച്ച", "കുടിവെള്ളം", "വെള്ളമില്ല",
            "ਪਾਣੀ", "ਨਲਕਾ", "ਪਾਈਪ", "ਲੀਕ", "ਪੀਣ ਵਾਲਾ ਪਾਣੀ", "ਪਾਣੀ ਨਹੀਂ",
            "ପାଣି", "ନଳ", "ପାଇପ", "ପିଇବା ପାଣି",
            "پانی", "نل", "پائپ لائن", "رساؤ", "پینے کا پانی"
        ]
    },
    {
        "dept": "Sewage & Drainage",
        "template": "Sewage overflow, clogged drain, or open manhole hazard",
        "severity": "High",
        "keywords": [
            "sewage", "sewer", "drain", "drainage", "manhole", "gutter", "overflow", "clogged", "dirty water", "foul smell", "stagnant water", "choked",
            "नाली", "नाला", "सीवर", "मैनहोल", "गटर", "गंदा पानी", "जलभराव", "बदबू", "जाम", "कीचड़", "नाली बंद", "सीवेज",
            "கழிவுநீர்", "சாக்கடை", "மேன்ஹோல்", "கால்வாய்", "அடைப்பு", "துர்நாற்றம்",
            "முరుగు", "డ్రైనేజీ", "మ్యాన్‌హోల్", "కాలువ", "முరుగునీరు", "దుర్వాసన", "జామ్",
            "ಒಳಚರಂಡಿ", "ಚರಂಡಿ", "ಮ್ಯಾನ್‌ಹೋಲ್", "ಕೊಳಚೆ ನೀರು", "ದುರ್ವಾಸನೆ", "ಬ್ಲಾಕ್",
            "सांडपाणी", "गटर", "मॅनहोल", "नाला", "घाण पाणी", "दुर्गंधी", "तुंबले",
            "নর্দমা", "ম্যানহোল", "ড্রেন", "নোংরা জল", "দুর্গন্ধ", "ড্রেনেজ",
            "ગટર", "નાળું", "મેનહોલ", "ગંદુ પાણી", "દુર્ગંધ", "ભરાયેલું પાણી",
            "ഡ്രെയിനേജ്", "അഴുക്കുചാൽ", "മാൻഹോൾ", "മലിനജലം",
            "ਗੰਦਾ ਪਾਣੀ", "ਨਾਲੀ", "ਸੀਵਰੇਜ", "ਗਟਰ", "ਬਦਬੂ",
            "ନର୍ଦ୍ଦମା", "ଡ୍ରେନ", "ମଇଳା ପାଣି",
            "گندا پانی", "نالی", "سیوریج", "گٹر", "بدبو"
        ]
    },
    {
        "dept": "Sanitation & Waste Management",
        "template": "Uncollected garbage accumulation and street cleanliness issue",
        "severity": "Medium",
        "keywords": [
            "garbage", "trash", "waste", "dump", "dustbin", "litter", "debris", "refuse", "sweeping", "plastic waste", "filth",
            "कचरा", "कूड़ा", "गंदगी", "डस्टबिन", "कचरे का ढेर", "सफाई", "कूड़ेदान", "बदबूदार कूड़ा", "कूड़ादान", "झाड़ू",
            "குப்பை", "கழிவு", "குப்பைத்தொட்டி", "அசுத்தம்", "துப்புரவு",
            "చెత్త", "వ్యర్థాలు", "డస్ట్‌బిన్", "చెత్త కుప్ప", "పారిశుధ్యం",
            "ಕಸ", "ತ್ಯಾಜ್ಯ", "ಕಸದ ತೊಟ್ಟಿ", "ಕೊಳಕು", "ಸ್ವಚ್ಛತೆ",
            "कचरा", "कचऱ्याचा ढीग", "डस्टबीन", "घाण", "स्वच्छता",
            "আবর্জনা", "ময়লা", "ডাস্টবিন", "জঞ্জাল", "পরিষ্কার",
            "કચરો", "કચરાપેટી", "ગંદકી", "સફાઈ",
            "മാലിന്യം", "ചപ്പുചവറുകൾ", "വേസ്റ്റ്", "ഡസ്റ്റ്ബിൻ",
            "ਕੂੜਾ", "ਗੰਦਗੀ", "ਡਸਟਬਿਨ", "ਸਫਾਈ",
            "ଅଳିଆ", "ଆବର୍ଜନା", "ଡଷ୍ଟବିନ",
            "کچرا", "کوڑا", "گندگی", "کوڑے دان", "صفائی"
        ]
    },
    {
        "dept": "Electricity / Street Lighting",
        "template": "Streetlight fault, dangling wire, or power outage risk",
        "severity": "Medium",
        "keywords": [
            "light", "streetlight", "street light", "electric", "power", "wire", "pole", "transformer", "spark", "dark", "voltage", "blackout",
            "बिजली", "स्ट्रीटलाइट", "लाइट", "खंभा", "तार", "ट्रांसफार्मर", "करंट", "अंधेरा", "बिजली गुल", "बत्ती", "स्ट्रीट लाइट बंद",
            "மின்சாரம்", "தெருவிளக்கு", "விளக்கு", "கம்பம்", "கம்பி", "மின்வெட்டு", "இருட்டு",
            "విద్యుత్", "స్ట్రీట్‌లైట్", "లైట్", "స్తంభం", "వైరు", "ట్రాన్స్‌ఫార్మర్", "కరెంట్ పోయింది", "చీకటి",
            "ವಿದ್ಯುತ್", "ಬೀದಿದೀಪ", "ಲೈಟ್", "ಕಂಬ", "ತಂತಿ", "ಕರೆಂಟ್ ಇಲ್ಲ", "ಕತ್ತಲೆ",
            "वीज", "पथदिवा", "लाईट", "खांब", "वायर", "ट्रान्सफॉर्मर", "वीज पुरवठा खंडित", "अंधार",
            "বিদ্যুৎ", "পথবাতি", "লাইট", "খুঁটি", "তার", "ট্রান্সফরমার", "লোডশেডিং", "অন্ধকার",
            "વીજળી", "સ્ટ્રીટલાઇટ", "લાઈટ", "થાંભલો", "વાયર", "અંધારું", "પાવર કટ",
            "വൈദ്യുതി", "തെരുവ് വിളക്ക്", "പോസ്റ്റ്", "കമ്പി", "കറന്റ് ഇല്ല",
            "ਬਿਜਲੀ", "ਸਟ੍ਰੀਟ ਲਾਈਟ", "ਖੰਭਾ", "ਤਾਰ", "ਹਨੇਰਾ",
            "ବିଦ୍ୟୁତ", "ଷ୍ଟ୍ରିଟ ଲାଇଟ", "ଖୁଣ୍ଟ", "ତାର",
            "بجلی", "اسٹریٹ لائٹ", "پول", "تار", "اندھیرا"
        ]
    },
    {
        "dept": "Public Health",
        "template": "Mosquito breeding, vector disease outbreak, or public health hazard",
        "severity": "High",
        "keywords": [
            "mosquito", "dengue", "malaria", "disease", "health", "hospital", "medicine", "fogging", "epidemic", "stagnant", "dead animal",
            "मच्छर", "डेंगू", "मलेरिया", "बीमारी", "स्वास्थ्य", "अस्पताल", "दवाई", "छिड़काव", "फॉगिंग", "मृत पशु",
            "கொசு", "டெங்கு", "மலேரியா", "நோய்", "சுகாதாரம்", "மருத்துவமனை",
            "దోమలు", "డెంగ్యూ", "మలేరియా", "వ్యాధి", "ఆరోగ్యం", "ఆసుపత్రి", "ఫాగింగ్",
            "ಸೊಳ್ಳೆ", "ಡೆಂಗ್ಯೂ", "ಮಲೇರಿಯಾ", "ರೋಗ", "ಆರೋಗ್ಯ", "ಆಸ್ಪತ್ರೆ", "ಫಾಗಿಂಗ್",
            "डास", "डेंग्यू", "मलेरिया", "आजार", "आरोग्य", "रुग्णालय", "फवारणी",
            "মশা", "ডেঙ্গু", "ম্যালেরিয়া", "রোগ", "স্বাস্থ্য", "হাসপাতাল",
            "મચ્છર", "ડેન્ગ્યુ", "મેલેરિયા", "રોગ", "આરોગ્ય", "દવા છંટકાવ",
            "കൊതുക്", "ഡെങ്കിപ്പനി", "മലേറിയ", "രോഗം", "ആരോഗ്യം",
            "ਮੱਛਰ", "ਡੇਂਗੂ", "ਮਲੇਰੀਆ", "ਬਿਮਾਰੀ", "ਸਿਹਤ",
            "ମଶା", "ଡେଙ୍ଗୁ", "ମ୍ୟାଲେରିଆ", "ରୋଗ", "ସ୍ୱାସ୍ଥ୍ୟ",
            "مچھر", "ڈینگی", "ملیریا", "بیماری", "صحت"
        ]
    }
]

def translate_to_english(text: str) -> str:
    """Translates regional text to English using Google Translate endpoint."""
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q={urllib.parse.quote(text)}"
        with httpx.Client(timeout=5.0) as client:
            res = client.get(url)
            if res.status_code == 200:
                data = res.json()
                if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                    translated = " ".join([item[0] for item in data[0] if item and len(item) > 0 and item[0]]).strip()
                    if translated:
                        return translated
    except Exception:
        pass
    return text

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
                        {"role": "user", "content": f"Grievance Text (Translate to English & Classify):\n{text}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1
                )
                parsed = json.loads(response.choices[0].message.content)
                if "summary" in parsed and parsed["summary"] and parsed.get("department") != "General Administration":
                    return parsed
        except Exception:
            continue

    # Multilingual smart keyword-based categorization
    text_lower = text.lower().strip()
    matched_rule = None
    for rule in MULTILINGUAL_RULES:
        if any(kw.lower() in text_lower for kw in rule["keywords"]):
            matched_rule = rule
            break

    english_trans = translate_to_english(text)

    dept = matched_rule["dept"] if matched_rule else "General Administration"
    severity = matched_rule["severity"] if matched_rule else "Medium"
    
    if english_trans and english_trans != text:
        summary = english_trans[:140] + "..." if len(english_trans) > 140 else english_trans
    elif matched_rule:
        summary = f"{matched_rule['template']}: \"{text[:60]}{'...' if len(text) > 60 else ''}\""
    else:
        summary = english_trans or (text[:120] + "..." if len(text) > 120 else text)

    return {
        "summary": summary,
        "department": dept,
        "urgency": severity,
        "extracted_location": "Not specified"
    }

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "Civic Grievance AI Backend with Multilingual Support",
        "groq_configured": bool(os.getenv("GROQ_API_KEY") and not os.getenv("GROQ_API_KEY").startswith("gsk_your"))
    }

@app.post("/analyze")
async def analyze_grievance(text: str = Form(...)):
    """Extracts English summary, department, and severity from regional or English grievance text."""
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
            "english_text": classification.get("summary", text_res),
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