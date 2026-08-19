import os
import sys
import tempfile
import random
import uuid
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure root directory is on Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_engine import classify_grievance, transcribe_and_translate_audio
from server.db import db_store
from server.schemas import (
    CreateComplaintSchema,
    UpdateStatusSchema,
    ComplaintResponseSchema,
    TrackComplaintResponseSchema
)

app = FastAPI(
    title="SIH Civic Grievance REST API Gateway",
    description="Backend service linking Supabase Database and Groq AI Engine for grievance ingestion, AI classification, routing, and tracking.",
    version="1.0.0"
)

# Enable CORS for web frontend dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory structure exists and mount static route
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
images_dir = os.path.join(uploads_dir, "images")
audios_dir = os.path.join(uploads_dir, "audios")
os.makedirs(images_dir, exist_ok=True)
os.makedirs(audios_dir, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Mount Citizen Portal static app directory
citizen_portal_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "citizen-portal")
citizen_dist_dir = os.path.join(citizen_portal_dir, "dist")
target_citizen_dir = citizen_dist_dir if os.path.exists(citizen_dist_dir) else citizen_portal_dir

if os.path.exists(target_citizen_dir):
    app.mount("/citizen", StaticFiles(directory=target_citizen_dir, html=True), name="citizen")

# Mount Officer Dashboard static app directory
officer_dashboard_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "officer-dashboard")
if os.path.exists(officer_dashboard_dir):
    app.mount("/dashboard", StaticFiles(directory=officer_dashboard_dir, html=True), name="dashboard")

VALID_STATUSES = ["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"]

@app.get("/")
def read_root():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/citizen/")

@app.get("/api/health")
def health_check():
    return {"status": "online", "service": "SIH Civic Grievance REST API Gateway"}


@app.post("/api/complaints", response_model=ComplaintResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    text: Optional[str] = Form(None),
    citizen_phone: str = Form("+919876543210"),
    lat: Optional[float] = Form(None),
    long: Optional[float] = Form(None),
    language_code: Optional[str] = Form("hi"),
    photo_url: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None)
):
    """
    Accepts text or audio input + optional lat/long coordinates, photo file.
    Passes text/audio through AI engine (AI4Bharat / Gemini / Groq).
    Maps department string to department_id.
    Generates tracking ID #GR-2026-XXXX and inserts into database with status 'PENDING'.
    """
    if photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1] or ".jpg"
        unique_name = f"photo_{uuid.uuid4().hex[:8]}{ext}"
        saved_file_path = os.path.join(images_dir, unique_name)
        photo_content = await photo.read()
        with open(saved_file_path, "wb") as f:
            f.write(photo_content)
        photo_url = f"/uploads/images/{unique_name}"

    audio_url = None
    raw_text = text or ""
    
    if audio and audio.filename:
        ext = os.path.splitext(audio.filename)[1] or ".mp3"
        unique_audio_name = f"audio_{uuid.uuid4().hex[:8]}{ext}"
        saved_audio_path = os.path.join(audios_dir, unique_audio_name)
        audio_content = await audio.read()
        with open(saved_audio_path, "wb") as f:
            f.write(audio_content)
        audio_url = f"/uploads/audios/{unique_audio_name}"
        
        try:
            raw_text = transcribe_and_translate_audio(saved_audio_path, language_code=language_code or "hi")
        except Exception as e:
            print(f"[WARN] Audio transcription failed: {e}")
            if not raw_text:
                raw_text = "Audio grievance submission (Transcription unavailable)"
                
    if not raw_text or not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'text', a 'photo', or an 'audio' file must be provided."
        )

    # Process text through AI classification engine
    try:
        ai_res = classify_grievance(raw_text)
    except Exception:
        ai_res = {
            "summary": raw_text[:100],
            "extracted_location": "Landmark from text",
            "urgency": "MEDIUM",
            "department": "Roads & Infrastructure"
        }

    dept_name = ai_res.get("department", "Roads & Infrastructure")
    urgency_val = ai_res.get("urgency", "MEDIUM").upper()
    summary_text = ai_res.get("summary", raw_text)
    
    # Database Operations
    dept_obj = db_store.get_department_by_name(dept_name)
    tracking_id = db_store.generate_tracking_id()
    
    created_record = db_store.create_complaint({
        "tracking_id": tracking_id,
        "citizen_phone": citizen_phone,
        "raw_text": raw_text,
        "translated_text": summary_text,
        "department_id": dept_obj["id"],
        "urgency": urgency_val,
        "lat": lat,
        "long": long,
        "photo_url": photo_url,
        "audio_url": audio_url
    })
    created_record["department_name"] = dept_obj["name"]
    return created_record


@app.get("/api/complaints", response_model=list)
def get_complaints(
    department: Optional[str] = Query(None, description="Department ID or department name filter"),
    urgency: Optional[str] = Query(None, description="Urgency level filter: LOW, MEDIUM, HIGH, CRITICAL"),
    status: Optional[str] = Query(None, description="Status filter: PENDING, IN_PROGRESS, RESOLVED, REJECTED")
):
    """
    Returns filtered list of grievances for officer dashboard.
    """
    return db_store.get_complaints(department=department, urgency=urgency, status=status)


@app.patch("/api/complaints/{id}/status", response_model=dict)
def update_complaint_status(id: str, payload: UpdateStatusSchema):
    """
    Updates complaint status ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')
    and creates a status audit log.
    """
    new_status = payload.status.upper()
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Must be one of: {VALID_STATUSES}"
        )
        
    return db_store.update_complaint_status(id, new_status, notes=payload.notes)


@app.get("/api/complaints/track/{tracking_id}", response_model=TrackComplaintResponseSchema)
def track_complaint(tracking_id: str):
    """
    Fetches complaint details and complete status timeline for citizen tracking.
    """
    clean_tracking_id = tracking_id if tracking_id.startswith("#") else f"#{tracking_id}"
    res = db_store.get_complaint_with_timeline(clean_tracking_id) or db_store.get_complaint_with_timeline(tracking_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No grievance found with tracking ID '{tracking_id}'."
        )
    return res
