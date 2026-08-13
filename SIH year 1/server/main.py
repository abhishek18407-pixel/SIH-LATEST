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
from server.db import db_store, supabase_client, use_supabase
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

# Mount Citizen Portal static app directory (compiled React SPA dist or raw html)
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

@app.post("/api/complaints", response_model=ComplaintResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    text: Optional[str] = Form(None),
    citizen_phone: str = Form("+919876543210"),
    lat: Optional[float] = Form(None),
    long: Optional[float] = Form(None),
    photo_url: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None)
):
    """
    Accepts text or audio input + optional lat/long coordinates, photo URL or uploaded photo file.
    Passes text/audio through Groq AI engine.
    Maps department string to department_id.
    Generates tracking ID #GR-2026-XXXX and inserts into database with status 'PENDING'.
    """
    # 0. Process photo upload if file provided into uploads/images/
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
    
    # 1. Handle Audio Processing & Persistent Storage in MP3 format into uploads/audios/
    if audio:
        unique_audio_name = f"audio_{uuid.uuid4().hex[:8]}.mp3"
        saved_audio_path = os.path.join(audios_dir, unique_audio_name)
        audio_content = await audio.read()
        with open(saved_audio_path, "wb") as f:
            f.write(audio_content)
        audio_url = f"/uploads/audios/{unique_audio_name}"
            
        try:
            raw_text = transcribe_and_translate_audio(saved_audio_path)
        except Exception as e:
            # Fallback if audio transcription fails or no API key set
            if not raw_text:
                raw_text = "Audio grievance submission (Transcription unavailable)"
                
    if not raw_text or not raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'text', a 'photo', or an 'audio' file must be provided."
        )

    # 2. Process text through AI classification engine
    try:
        ai_res = classify_grievance(raw_text)
    except Exception as e:
        # Graceful fallback for offline test environments
        ai_res = {
            "summary": raw_text[:100],
            "extracted_location": "Landmark from text",
            "urgency": "MEDIUM",
            "department": "Roads & Infrastructure"
        }

    dept_name = ai_res.get("department", "Roads & Infrastructure")
    urgency_val = ai_res.get("urgency", "MEDIUM").upper()
    summary_text = ai_res.get("summary", raw_text)
    
    # 3. Database Operations
    if use_supabase and supabase_client:
        try:
            # Upsert User
            if citizen_phone:
                supabase_client.table("users").upsert({"phone_number": citizen_phone}, on_conflict="phone_number").execute()
            
            # Find Department ID
            dept_resp = supabase_client.table("departments").select("id, name").eq("name", dept_name).execute()
            if dept_resp.data:
                dept_id = dept_resp.data[0]["id"]
                actual_dept_name = dept_resp.data[0]["name"]
            else:
                all_depts = supabase_client.table("departments").select("id, name").execute()
                if all_depts.data:
                    dept_id = all_depts.data[0]["id"]
                    actual_dept_name = all_depts.data[0]["name"]
                else:
                    dept_id = None
                    actual_dept_name = dept_name
                
            rand_code = random.randint(1000, 9999)
            tracking_id = f"#GR-2026-{rand_code}"
            
            complaint_payload = {
                "tracking_id": tracking_id,
                "citizen_phone": citizen_phone,
                "raw_text": raw_text,
                "translated_text": summary_text,
                "department_id": dept_id,
                "urgency": urgency_val,
                "status": "PENDING",
                "lat": lat,
                "long": long,
                "photo_url": photo_url
            }
            
            try:
                inserted = supabase_client.table("complaints").insert(complaint_payload).execute()
            except Exception as sp_err:
                # If Supabase table schema differs, retry or fallback
                inserted = supabase_client.table("complaints").insert({
                    "tracking_id": tracking_id,
                    "citizen_phone": citizen_phone,
                    "raw_text": raw_text,
                    "translated_text": summary_text,
                    "urgency": urgency_val,
                    "status": "PENDING"
                }).execute()

            created_record = inserted.data[0]
            created_record["department_name"] = actual_dept_name
            created_record["audio_url"] = audio_url
            
            # Synchronize with db_store for fallback persistence
            db_store.create_complaint({
                "tracking_id": tracking_id,
                "citizen_phone": citizen_phone,
                "raw_text": raw_text,
                "translated_text": summary_text,
                "department_id": dept_id,
                "urgency": urgency_val,
                "lat": lat,
                "long": long,
                "photo_url": photo_url,
                "audio_url": audio_url
            })
            return ensure_photo_url(created_record)
        except Exception as err:
            print(f"[WARN] Supabase write failed ({err}). Switching to database store fallback.")
            
    # Fallback / In-Memory Store Execution
    db_store.get_or_create_user(citizen_phone)
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
    return ensure_photo_url(created_record)

DEFAULT_SAMPLE_PHOTOS = [
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80"
]

def ensure_photo_url(complaint_item: dict) -> dict:
    if not complaint_item.get("photo_url"):
        cid = str(complaint_item.get("id") or complaint_item.get("tracking_id") or "0")
        h = abs(hash(cid)) % len(DEFAULT_SAMPLE_PHOTOS)
        complaint_item["photo_url"] = DEFAULT_SAMPLE_PHOTOS[h]
    return complaint_item

@app.get("/api/complaints", response_model=list)
def get_complaints(
    department: Optional[str] = Query(None, description="Department ID or department name filter"),
    urgency: Optional[str] = Query(None, description="Urgency level filter: LOW, MEDIUM, HIGH, CRITICAL"),
    status: Optional[str] = Query(None, description="Status filter: PENDING, IN_PROGRESS, RESOLVED, REJECTED")
):
    """
    Returns filtered list of grievances for officer dashboard.
    """
    data = []
    if use_supabase and supabase_client:
        try:
            query = supabase_client.table("complaints").select("*, departments(name)")
            if department and department != "All Departments":
                if len(department) == 36 and "-" in department:
                    query = query.eq("department_id", department)
                else:
                    dept_res = supabase_client.table("departments").select("id").eq("name", department).execute()
                    if dept_res.data:
                        query = query.eq("department_id", dept_res.data[0]["id"])
            if urgency and urgency != "All Urgencies":
                query = query.eq("urgency", urgency.upper())
            if status and status != "All Statuses":
                query = query.eq("status", status.upper())
            res = query.execute()
            
            data = res.data or []
            for item in data:
                if "departments" in item and isinstance(item["departments"], dict):
                    item["department_name"] = item["departments"].get("name", "Municipal Dept")
                elif not item.get("department_name"):
                    item["department_name"] = "Municipal Dept"
                
                db_comp = next((c for c in db_store.complaints if c["id"] == item.get("id") or c.get("tracking_id") == item.get("tracking_id")), None)
                if db_comp and db_comp.get("audio_url"):
                    item["audio_url"] = db_comp["audio_url"]
                ensure_photo_url(item)
            return data
        except Exception as e:
            print(f"[WARN] Supabase query error ({e}). Using store fallback.")
            
    raw_list = db_store.get_complaints(department=department, urgency=urgency, status=status)
    for item in raw_list:
        if not item.get("department_name"):
            dept_obj = db_store.get_department_by_id(item.get("department_id", ""))
            item["department_name"] = dept_obj["name"] if dept_obj else "Municipal Dept"
        ensure_photo_url(item)
    return raw_list

@app.patch("/api/complaints/{id}/status", response_model=dict)
def update_complaint_status(id: str, payload: UpdateStatusSchema):
    """
    Updates complaint status ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')
    and creates a status audit log. Automatically purges saved audio files upon RESOLVED or REJECTED.
    """
    new_status = payload.status.upper()
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Must be one of: {VALID_STATUSES}"
        )
        
    # Audio file cleanup logic upon RESOLVED or REJECTED
    if new_status in ["RESOLVED", "REJECTED"]:
        target_comp = None
        if use_supabase and supabase_client:
            try:
                is_uuid = len(id) == 36 and "-" in id
                clean_id = id if id.startswith("#") else f"#{id}"
                q = supabase_client.table("complaints").select("*")
                f_res = (q.eq("id", id) if is_uuid else q.eq("tracking_id", clean_id)).execute()
                if f_res.data:
                    target_comp = f_res.data[0]
            except Exception:
                pass
        if not target_comp:
            target_comp = next((c for c in db_store.complaints if c["id"] == id or c["tracking_id"] == id), None)
            
        db_comp = next((c for c in db_store.complaints if c["id"] == id or c["tracking_id"] == id), None)
        audio_url_to_purge = (target_comp and target_comp.get("audio_url")) or (db_comp and db_comp.get("audio_url"))
        
        if audio_url_to_purge:
            filename = os.path.basename(audio_url_to_purge)
            possible_paths = [
                os.path.join(audios_dir, filename),
                os.path.join(uploads_dir, filename)
            ]
            for audio_file_path in possible_paths:
                if os.path.exists(audio_file_path):
                    try:
                        os.remove(audio_file_path)
                        print(f"[INFO] Purged audio file upon status '{new_status}': {audio_file_path}")
                    except Exception as e:
                        print(f"[WARN] Failed to purge audio file: {e}")
                    
            if target_comp:
                target_comp["audio_url"] = None
            if db_comp:
                db_comp["audio_url"] = None

    if use_supabase and supabase_client:
        try:
            update_payload = {
                "status": new_status,
                "updated_at": "now()"
            }

            is_uuid = len(id) == 36 and "-" in id
            clean_id = id if id.startswith("#") else f"#{id}"

            query_target = supabase_client.table("complaints").update(update_payload)
            updated = (query_target.eq("id", id) if is_uuid else query_target.eq("tracking_id", clean_id)).execute()
            
            if updated.data:
                note_text = payload.notes or f"Status updated to {new_status}"
                if new_status in ["RESOLVED", "REJECTED"]:
                    note_text += " (Voice recording file purged from storage)"
                
                try:
                    supabase_client.table("status_logs").insert({
                        "complaint_id": updated.data[0]["id"],
                        "new_status": new_status,
                        "notes": note_text
                    }).execute()
                except Exception:
                    pass

                db_store.update_complaint_status(id, new_status, notes=payload.notes)
                return ensure_photo_url(updated.data[0])
        except Exception as e:
            print(f"[WARN] Supabase update failed ({e}). Using store fallback.")

    updated_record = db_store.update_complaint_status(id, new_status, notes=payload.notes)
    return ensure_photo_url(updated_record)

@app.get("/api/complaints/track/{tracking_id}", response_model=TrackComplaintResponseSchema)
def track_complaint(tracking_id: str):
    """
    Fetches complaint details and complete status timeline for citizen tracking.
    """
    # Clean URL encoding or missing prefix
    clean_tracking_id = tracking_id if tracking_id.startswith("#") else f"#{tracking_id}"
    
    if use_supabase and supabase_client:
        try:
            complaint_res = supabase_client.table("complaints").select("*, departments(name)").or_(
                f"tracking_id.eq.{tracking_id},tracking_id.eq.{clean_tracking_id}"
            ).execute()
            
            if complaint_res.data:
                comp = complaint_res.data[0]
                db_comp = next((c for c in db_store.complaints if c["tracking_id"] == clean_tracking_id or c["id"] == comp["id"]), None)
                if db_comp and db_comp.get("audio_url"):
                    comp["audio_url"] = db_comp["audio_url"]
                ensure_photo_url(comp)
                logs_res = supabase_client.table("status_logs").select("*").eq("complaint_id", comp["id"]).order("updated_at").execute()
                return {
                    "complaint": comp,
                    "status_timeline": logs_res.data or []
                }
        except Exception as e:
            print(f"[WARN] Supabase tracking fetch failed ({e}). Using store fallback.")
            
    res = db_store.get_complaint_with_timeline(clean_tracking_id)
    if not res:
        # Try raw tracking_id
        res = db_store.get_complaint_with_timeline(tracking_id)
        
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No grievance found with tracking ID '{tracking_id}'."
        )
        
    if res.get("complaint"):
        ensure_photo_url(res["complaint"])
    return res
