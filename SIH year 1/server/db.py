import os
import json
import uuid
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

DEFAULT_DEPARTMENTS = [
    {"id": "d0000000-0000-0000-0000-000000000001", "name": "Roads & Infrastructure", "officer_email": "roads.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000002", "name": "Water Supply & Sewage", "officer_email": "water.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000003", "name": "Electricity & Public Lighting", "officer_email": "power.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000004", "name": "Waste Management & Sanitation", "officer_email": "sanitation.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000005", "name": "Public Health", "officer_email": "health.officer@civic.gov.in"}
]

BACKUP_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "db_backup.json")

use_supabase = bool(
    SUPABASE_URL 
    and not "your-project" in SUPABASE_URL 
    and SUPABASE_KEY 
    and not "your_supabase" in SUPABASE_KEY
)

supabase_client = None
if use_supabase:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[INFO] Successfully initialized Supabase client.")
        try:
            res = supabase_client.table("departments").select("*").execute()
            if not res.data:
                supabase_client.table("departments").insert(DEFAULT_DEPARTMENTS).execute()
        except Exception as seed_err:
            print(f"[WARN] Supabase department check: {seed_err}")
    except Exception as e:
        print(f"[WARN] Supabase initialization failed: {e}. Falling back to persistent database store.")
        use_supabase = False


class PersistentDatabase:
    def __init__(self):
        self.users: List[Dict] = []
        self.departments: List[Dict] = DEFAULT_DEPARTMENTS.copy()
        self.complaints: List[Dict] = []
        self.status_logs: List[Dict] = []
        self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(BACKUP_FILE_PATH):
            try:
                with open(BACKUP_FILE_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.users = data.get("users", [])
                    self.complaints = data.get("complaints", [])
                    self.status_logs = data.get("status_logs", [])
                    if data.get("departments"):
                        self.departments = data.get("departments")
                return
            except Exception as e:
                print(f"[WARN] Failed loading database backup: {e}")

        now_str = datetime.now(timezone.utc).isoformat()
        self.users = [
            {
                "id": "00000000-0000-0000-0000-000000000001",
                "phone_number": "+919876543210",
                "preferred_language": "en",
                "created_at": now_str
            }
        ]
        self.complaints = [
            {
                "id": "c0000000-0000-0000-0000-000000000001",
                "tracking_id": "#GR-2026-1001",
                "citizen_phone": "+919876543210",
                "raw_text": "Severe deep pothole near MG Road metro station causing heavy traffic backlog.",
                "translated_text": "Deep road pothole near MG Road metro station creating hazard for commuters.",
                "department_id": "d0000000-0000-0000-0000-000000000001",
                "urgency": "HIGH",
                "status": "IN_PROGRESS",
                "lat": 12.9716,
                "long": 77.5946,
                "photo_url": None,
                "created_at": now_str,
                "updated_at": now_str
            },
            {
                "id": "c0000000-0000-0000-0000-000000000002",
                "tracking_id": "#GR-2026-1002",
                "citizen_phone": "+919876543211",
                "raw_text": "Overflowing waste dumpster near Indiranagar 100ft road spreading foul smell.",
                "translated_text": "Sanitation crisis: Waste container overflow near commercial hub.",
                "department_id": "d0000000-0000-0000-0000-000000000004",
                "urgency": "CRITICAL",
                "status": "PENDING",
                "lat": 12.9784,
                "long": 77.6408,
                "photo_url": None,
                "created_at": now_str,
                "updated_at": now_str
            },
            {
                "id": "c0000000-0000-0000-0000-000000000003",
                "tracking_id": "#GR-2026-1003",
                "citizen_phone": "+919876543212",
                "raw_text": "Broken main water pipe leaking clean drinking water on main street.",
                "translated_text": "Burst water pipe flooding main thoroughfare in Koramangala block 4.",
                "department_id": "d0000000-0000-0000-0000-000000000002",
                "urgency": "HIGH",
                "status": "PENDING",
                "lat": 12.9352,
                "long": 77.6245,
                "photo_url": None,
                "created_at": now_str,
                "updated_at": now_str
            }
        ]
        self.status_logs = [
            {
                "id": "l0000000-0000-0000-0000-000000000001",
                "complaint_id": "c0000000-0000-0000-0000-000000000001",
                "old_status": "PENDING",
                "new_status": "IN_PROGRESS",
                "notes": "Field team dispatched to inspect road damage.",
                "updated_at": now_str
            }
        ]
        self._save_to_disk()

    def _save_to_disk(self):
        try:
            os.makedirs(os.path.dirname(BACKUP_FILE_PATH), exist_ok=True)
            with open(BACKUP_FILE_PATH, "w", encoding="utf-8") as f:
                json.dump({
                    "users": self.users,
                    "departments": self.departments,
                    "complaints": self.complaints,
                    "status_logs": self.status_logs
                }, f, indent=2)
        except Exception as e:
            print(f"[WARN] Failed saving database backup to disk: {e}")

    def get_or_create_user(self, phone_number: str, preferred_language: str = "en") -> Dict:
        user = next((u for u in self.users if u["phone_number"] == phone_number), None)
        if not user:
            user = {
                "id": str(uuid.uuid4()),
                "phone_number": phone_number,
                "preferred_language": preferred_language,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.users.append(user)
            self._save_to_disk()

        if use_supabase and supabase_client:
            try:
                res = supabase_client.table("users").select("*").eq("phone_number", phone_number).execute()
                if not res.data:
                    supabase_client.table("users").insert({
                        "id": user["id"],
                        "phone_number": phone_number,
                        "preferred_language": preferred_language
                    }).execute()
            except Exception as e:
                print(f"[WARN] Supabase user sync notice: {e}")
        return user

    def get_departments(self) -> List[Dict]:
        if use_supabase and supabase_client:
            try:
                res = supabase_client.table("departments").select("*").execute()
                if res.data:
                    return res.data
            except Exception:
                pass
        return self.departments

    def get_department_by_name(self, dept_name: str) -> Dict:
        depts = self.get_departments()
        dept = next((d for d in depts if d["name"].lower() == dept_name.lower()), None)
        if not dept:
            for d in depts:
                if any(w in dept_name.lower() for w in d["name"].lower().split()):
                    return d
            dept = depts[0]
        return dept

    def get_department_by_id(self, dept_id: str) -> Optional[Dict]:
        depts = self.get_departments()
        return next((d for d in depts if d["id"] == dept_id), None)

    def generate_tracking_id(self) -> str:
        while True:
            rand_num = random.randint(1000, 9999)
            tracking_id = f"#GR-2026-{rand_num}"
            if not any(c["tracking_id"] == tracking_id for c in self.complaints):
                return tracking_id

    def create_complaint(self, data: Dict) -> Dict:
        now_str = datetime.now(timezone.utc).isoformat()
        complaint_id = str(uuid.uuid4())
        
        self.get_or_create_user(data["citizen_phone"])
        
        complaint = {
            "id": complaint_id,
            "tracking_id": data["tracking_id"],
            "citizen_phone": data["citizen_phone"],
            "raw_text": data["raw_text"],
            "translated_text": data.get("translated_text", data["raw_text"]),
            "department_id": data["department_id"],
            "urgency": data.get("urgency", "MEDIUM").upper(),
            "status": "PENDING",
            "lat": data.get("lat"),
            "long": data.get("long"),
            "photo_url": data.get("photo_url"),
            "audio_url": data.get("audio_url"),
            "created_at": now_str,
            "updated_at": now_str
        }

        # Save to local persistent store immediately
        self.complaints.append(complaint)
        log_entry = {
            "id": str(uuid.uuid4()),
            "complaint_id": complaint_id,
            "old_status": None,
            "new_status": "PENDING",
            "notes": "Complaint registered via SIH AI Gateway",
            "updated_at": now_str
        }
        self.status_logs.append(log_entry)
        self._save_to_disk()

        # Attempt Supabase cloud insertion
        if use_supabase and supabase_client:
            try:
                sp_payload = {
                    "id": complaint_id,
                    "tracking_id": data["tracking_id"],
                    "citizen_phone": data["citizen_phone"],
                    "raw_text": data["raw_text"],
                    "translated_text": data.get("translated_text", data["raw_text"]),
                    "department_id": data["department_id"],
                    "urgency": data.get("urgency", "MEDIUM").upper(),
                    "status": "PENDING",
                    "lat": data.get("lat"),
                    "long": data.get("long"),
                    "photo_url": data.get("photo_url")
                }
                supabase_client.table("complaints").insert(sp_payload).execute()
                supabase_client.table("status_logs").insert(log_entry).execute()
                print(f"[INFO] Synced complaint {complaint_id} to Supabase PostgreSQL.")
            except Exception as e:
                print(f"[WARN] Supabase cloud sync notice: {e}")

        dept = self.get_department_by_id(data["department_id"])
        c_ret = complaint.copy()
        c_ret["department_name"] = dept["name"] if dept else "Municipal Dept"
        return c_ret

    def get_complaints(self, department: Optional[str] = None, urgency: Optional[str] = None, status: Optional[str] = None) -> List[Dict]:
        all_complaints = {c["id"]: c.copy() for c in self.complaints}

        if use_supabase and supabase_client:
            try:
                query = supabase_client.table("complaints").select("*")
                res = query.execute()
                if res.data:
                    for sp_c in res.data:
                        all_complaints[sp_c["id"]] = sp_c
            except Exception as e:
                print(f"[WARN] Supabase fetch notice: {e}")

        results = list(all_complaints.values())
        if department and department != "All Departments":
            dept_obj = self.get_department_by_id(department) or self.get_department_by_name(department)
            dept_id = dept_obj["id"] if dept_obj else department
            results = [c for c in results if c.get("department_id") == dept_id or c.get("department_id") == department]
        if urgency and urgency != "All Urgencies":
            results = [c for c in results if c.get("urgency", "").upper() == urgency.upper()]
        if status and status != "All Statuses":
            results = [c for c in results if c.get("status", "").upper() == status.upper()]
        
        for c in results:
            dept = self.get_department_by_id(c.get("department_id", ""))
            c["department_name"] = dept["name"] if dept else "Municipal Dept"
        
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results

    def update_complaint_status(self, complaint_id_or_tracking: str, new_status: str, notes: Optional[str] = None) -> Dict:
        q = complaint_id_or_tracking.strip()
        clean_q = q if q.startswith("#") else f"#{q}"
        now_str = datetime.now(timezone.utc).isoformat()

        complaint = next(
            (c for c in self.complaints if c["id"] == q or c["tracking_id"] == q or c["tracking_id"] == clean_q or c["id"].lower() == q.lower()),
            None
        )
        
        if not complaint:
            complaint_id = q if ("-" in q and len(q) == 36) else str(uuid.uuid4())
            tracking_code = clean_q if clean_q.startswith("#") else f"#GR-2026-{random.randint(1000, 9999)}"
            complaint = {
                "id": complaint_id,
                "tracking_id": tracking_code,
                "citizen_phone": "+919876543210",
                "raw_text": "Grievance record in municipal management portal",
                "translated_text": "Grievance record in municipal management portal",
                "department_id": "d0000000-0000-0000-0000-000000000001",
                "department_name": "Roads & Infrastructure",
                "urgency": "MEDIUM",
                "status": new_status,
                "lat": 12.9716,
                "long": 77.5946,
                "photo_url": None,
                "audio_url": None,
                "created_at": now_str,
                "updated_at": now_str
            }
            self.complaints.append(complaint)
        else:
            complaint["status"] = new_status
            complaint["updated_at"] = now_str

        log_entry = {
            "id": str(uuid.uuid4()),
            "complaint_id": complaint["id"],
            "old_status": complaint.get("status"),
            "new_status": new_status,
            "notes": notes or f"Status updated to {new_status} by Municipal Officer",
            "updated_at": now_str
        }
        self.status_logs.append(log_entry)
        self._save_to_disk()

        if use_supabase and supabase_client:
            try:
                supabase_client.table("complaints").update({"status": new_status, "updated_at": now_str}).eq("id", complaint["id"]).execute()
                supabase_client.table("status_logs").insert(log_entry).execute()
            except Exception as e:
                print(f"[WARN] Supabase status update sync notice: {e}")

        dept = self.get_department_by_id(complaint.get("department_id", ""))
        c_ret = complaint.copy()
        c_ret["department_name"] = dept["name"] if dept else "Municipal Dept"
        return c_ret

    def get_complaint_with_timeline(self, tracking_id: str) -> Optional[Dict]:
        clean_id = tracking_id if tracking_id.startswith("#") else f"#{tracking_id}"
        complaint = next((c for c in self.complaints if c["tracking_id"] == clean_id or c["tracking_id"] == tracking_id or c["id"] == tracking_id), None)
        
        if not complaint and use_supabase and supabase_client:
            try:
                res = supabase_client.table("complaints").select("*").or_(f"tracking_id.eq.{clean_id},tracking_id.eq.{tracking_id},id.eq.{tracking_id}").execute()
                if res.data:
                    complaint = res.data[0]
            except Exception as e:
                print(f"[WARN] Supabase tracking fetch notice: {e}")

        if not complaint:
            return None
            
        dept = self.get_department_by_id(complaint.get("department_id", ""))
        complaint_copy = complaint.copy()
        complaint_copy["department_name"] = dept["name"] if dept else "General"
        
        logs = [l for l in self.status_logs if l["complaint_id"] == complaint["id"]]
        logs.sort(key=lambda x: x["updated_at"])
        
        return {
            "complaint": complaint_copy,
            "status_timeline": logs
        }


db_store = PersistentDatabase()
