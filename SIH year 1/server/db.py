import os
import uuid
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Initial seed departments
DEFAULT_DEPARTMENTS = [
    {"id": "d0000000-0000-0000-0000-000000000001", "name": "Roads & Infrastructure", "officer_email": "roads.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000002", "name": "Water Supply & Sewage", "officer_email": "water.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000003", "name": "Electricity & Public Lighting", "officer_email": "power.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000004", "name": "Waste Management & Sanitation", "officer_email": "sanitation.officer@civic.gov.in"},
    {"id": "d0000000-0000-0000-0000-000000000005", "name": "Public Health", "officer_email": "health.officer@civic.gov.in"}
]

# Check if valid Supabase client can be created
use_supabase = bool(
    SUPABASE_URL 
    and not SUPABASE_URL.startswith("https://your-project") 
    and SUPABASE_KEY 
    and not SUPABASE_KEY.startswith("your_supabase")
)

supabase_client = None
if use_supabase:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[INFO] Connected to Supabase cloud instance.")
    except Exception as e:
        print(f"[WARN] Supabase connection failed: {e}. Falling back to in-memory database store.")
        use_supabase = False
else:
    print("[INFO] No live Supabase credentials set. Using in-memory high-fidelity database store for local testing.")

# High-fidelity in-memory database fallback store
class InMemoryDatabase:
    def __init__(self):
        self.users: List[Dict] = [
            {
                "id": "u0000000-0000-0000-0000-000000000001",
                "phone_number": "+919876543210",
                "preferred_language": "en",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        self.departments: List[Dict] = DEFAULT_DEPARTMENTS.copy()
        now_str = datetime.now(timezone.utc).isoformat()
        
        # Initial seed complaints with photo URLs for officer dashboard display
        self.complaints: List[Dict] = [
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
                "photo_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
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
                "photo_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
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
                "photo_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
                "created_at": now_str,
                "updated_at": now_str
            }
        ]
        self.status_logs: List[Dict] = [
            {
                "id": "l0000000-0000-0000-0000-000000000001",
                "complaint_id": "c0000000-0000-0000-0000-000000000001",
                "old_status": "PENDING",
                "new_status": "IN_PROGRESS",
                "notes": "Field team dispatched to inspect road damage.",
                "updated_at": now_str
            }
        ]

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
        return user

    def get_department_by_name(self, dept_name: str) -> Dict:
        dept = next((d for d in self.departments if d["name"].lower() == dept_name.lower()), None)
        if not dept:
            # Match partial keywords
            for d in self.departments:
                if any(w in dept_name.lower() for w in d["name"].lower().split()):
                    return d
            dept = self.departments[0]
        return dept

    def get_department_by_id(self, dept_id: str) -> Optional[Dict]:
        return next((d for d in self.departments if d["id"] == dept_id), None)

    def generate_tracking_id(self) -> str:
        while True:
            rand_num = random.randint(1000, 9999)
            tracking_id = f"#GR-2026-{rand_num}"
            if not any(c["tracking_id"] == tracking_id for c in self.complaints):
                return tracking_id

    def create_complaint(self, data: Dict) -> Dict:
        now_str = datetime.now(timezone.utc).isoformat()
        complaint_id = str(uuid.uuid4())
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
        self.complaints.append(complaint)

        # Trigger automatic status log
        log_entry = {
            "id": str(uuid.uuid4()),
            "complaint_id": complaint_id,
            "old_status": None,
            "new_status": "PENDING",
            "notes": "Complaint registered via SIH AI Gateway",
            "updated_at": now_str
        }
        self.status_logs.append(log_entry)
        return complaint

    def get_complaints(self, department: Optional[str] = None, urgency: Optional[str] = None, status: Optional[str] = None) -> List[Dict]:
        results = [c.copy() for c in self.complaints]
        if department and department != "All Departments":
            # Check if department is ID or Name
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
        return results

    def update_complaint_status(self, complaint_id_or_tracking: str, new_status: str, notes: Optional[str] = None) -> Dict:
        q = complaint_id_or_tracking.strip()
        clean_q = q if q.startswith("#") else f"#{q}"
        
        complaint = next(
            (c for c in self.complaints if c["id"] == q or c["tracking_id"] == q or c["tracking_id"] == clean_q or c["id"].lower() == q.lower()),
            None
        )
        
        now_str = datetime.now(timezone.utc).isoformat()
        
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

        # Add status audit log entry
        log_entry = {
            "id": str(uuid.uuid4()),
            "complaint_id": complaint["id"],
            "old_status": complaint.get("status"),
            "new_status": new_status,
            "notes": notes or f"Status updated to {new_status} by Municipal Officer",
            "updated_at": now_str
        }
        self.status_logs.append(log_entry)
        return complaint

    def get_complaint_with_timeline(self, tracking_id: str) -> Optional[Dict]:
        # Normalize tracking_id (#GR-2026-XXXX vs GR-2026-XXXX)
        clean_id = tracking_id if tracking_id.startswith("#") else f"#{tracking_id}"
        complaint = next((c for c in self.complaints if c["tracking_id"] == clean_id or c["tracking_id"] == tracking_id or c["id"] == tracking_id), None)
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

db_store = InMemoryDatabase()
