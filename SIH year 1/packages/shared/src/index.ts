export interface User {
  id: string;
  phone_number: string;
  preferred_language: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  officer_email: string;
  created_at?: string;
}

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Complaint {
  id: string;
  tracking_id: string;
  citizen_phone: string;
  raw_text: string;
  translated_text?: string;
  department_id?: string;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  lat?: number;
  long?: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusLog {
  id: string;
  complaint_id: string;
  old_status?: ComplaintStatus;
  new_status: ComplaintStatus;
  notes?: string;
  updated_at: string;
}
