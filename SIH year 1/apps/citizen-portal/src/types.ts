export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export interface ComplaintResult {
  id: string;
  tracking_id: string;
  citizen_phone: string;
  raw_text: string;
  translated_text?: string;
  department_id?: string;
  department_name?: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  lat?: number;
  long?: number;
  photo_url?: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusTimelineLog {
  id: string;
  complaint_id: string;
  old_status?: string | null;
  new_status: string;
  notes?: string;
  updated_at: string;
}

export interface TrackResult {
  complaint: ComplaintResult;
  status_timeline: StatusTimelineLog[];
}
