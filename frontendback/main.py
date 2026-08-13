import os
import shutil
import tempfile

import whisper
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Civic Grievance - Multilingual AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Whisper model... this may take a minute the first time.")
model = whisper.load_model("medium")
print("Whisper model loaded.")

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
    "ur": "Urdu",
}


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Multilingual AI backend is running"}


@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form(default=None),  # language code from the frontend's Language Selection screen, e.g. "te"
):
    suffix = os.path.splitext(file.filename)[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # If the frontend told us the language, use it directly — this skips Whisper's
        # auto-detection pass entirely, which is both faster AND more accurate than guessing,
        # especially for short clips or similar-sounding Indian languages.
        lang_arg = language if language else None

        if lang_arg == "en":
            # Already English — one pass is enough, original == english
            result = model.transcribe(tmp_path, task="transcribe", language="en")
            original_text = result.get("text", "").strip()
            english_text = original_text
            detected_lang_code = "en"
        else:
            # One pass gets the original-language text
            transcribe_result = model.transcribe(tmp_path, task="transcribe", language=lang_arg)
            original_text = transcribe_result.get("text", "").strip()
            detected_lang_code = lang_arg or transcribe_result.get("language", "en")

            # Second pass translates straight to English, still locked to the same language
            translate_result = model.transcribe(tmp_path, task="translate", language=lang_arg)
            english_text = translate_result.get("text", "").strip()

        return {
            "success": True,
            "detected_language_code": detected_lang_code,
            "detected_language_name": LANGUAGE_NAMES.get(detected_lang_code, detected_lang_code),
            "original_text": original_text,
            "english_text": english_text,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        os.remove(tmp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)