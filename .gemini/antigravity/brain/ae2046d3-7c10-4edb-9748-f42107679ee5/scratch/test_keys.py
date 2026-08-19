import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="SIH year 1/.env")

groq_key = os.getenv("GROQ_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

print("Testing Groq API Key...")
try:
    from groq import Groq
    client = Groq(api_key=groq_key)
    res = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": "Ping"}]
    )
    print("Groq success:", res.choices[0].message.content)
except Exception as e:
    print("Groq error:", e)

print("\nTesting Gemini API Key...")
try:
    import httpx
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
    res = httpx.post(url, json={"contents": [{"parts": [{"text": "Ping"}]}]}, timeout=10.0)
    print("Gemini status:", res.status_code)
    print("Gemini response:", res.text[:200])
except Exception as e:
    print("Gemini error:", e)
