from pydantic import BaseModel, Field
from typing import Optional, List

class CreateComplaintSchema(BaseModel):
    text: Optional[str] = Field(None, description="Raw text of the grievance")
    citizen_phone: str = Field("+919876543210", description="Citizen primary phone number")
    lat: Optional[float] = Field(None, description="Latitude coordinates")
    long: Optional[float] = Field(None, description="Longitude coordinates")
    photo_url: Optional[str] = Field(None, description="URL of grievance proof photo")

class UpdateStatusSchema(BaseModel):
    status: str = Field(..., description="New status: 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'")
    notes: Optional[str] = Field(None, description="Optional officer notes regarding the status update")

class StatusLogSchema(BaseModel):
    id: str
    complaint_id: str
    old_status: Optional[str] = None
    new_status: str
    notes: Optional[str] = None
    updated_at: str

class ComplaintResponseSchema(BaseModel):
    id: str
    tracking_id: str
    citizen_phone: str
    raw_text: str
    translated_text: Optional[str] = None
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    urgency: str
    status: str
    lat: Optional[float] = None
    long: Optional[float] = None
    photo_url: Optional[str] = None
    audio_url: Optional[str] = None
    created_at: str
    updated_at: str

class TrackComplaintResponseSchema(BaseModel):
    complaint: dict
    status_timeline: List[dict]
