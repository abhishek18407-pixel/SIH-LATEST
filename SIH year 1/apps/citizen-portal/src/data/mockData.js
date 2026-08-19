// Mock data so the frontend works standalone before backend/AI integration

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

export const DEPARTMENTS = [
  "Roads & Infrastructure (PWD)",
  "Sanitation & Waste Management",
  "Water Supply",
  "Sewage & Drainage",
  "Electricity / Street Lighting",
  "Parks, Gardens & Environment",
  "Traffic & Transport",
  "Public Health",
  "Building & Town Planning",
  "Animal Control (Stray Animals)",
  "Fire Department",
  "Encroachment & Illegal Construction",
  "Flood & Disaster Management",
  "Public Toilets",
  "Noise Pollution Control",
  "Air/Water Pollution Control",
  "Slum Development",
  "Municipal Markets",
  "Cemetery & Crematorium Services",
  "General Administration",
];
// Simulates what the AI/NLP backend would return after processing
// speech-to-text + intent classification + NER
export function mockAIAnalyze(transcript) {
  const text = transcript.toLowerCase().trim();

  // Keyword sets per department — matched against the complaint text.
  // Real system: this logic lives in an LLM/NER model, not keyword matching.
  const rules = [
    { dept: "Roads & Infrastructure (PWD)", keywords: ["pothole", "road", "footpath", "pavement", "bridge", "crack"], severity: "High" },
    { dept: "Sanitation & Waste Management", keywords: ["garbage", "trash", "waste", "litter", "dump"], severity: "Medium" },
    { dept: "Water Supply", keywords: ["no water", "water supply", "water shortage", "tap water", "pipeline leak"], severity: "High" },
    { dept: "Sewage & Drainage", keywords: ["sewage", "drain", "manhole", "overflow", "clogged"], severity: "High" },
    { dept: "Electricity / Street Lighting", keywords: ["streetlight", "street light", "power cut", "electricity", "transformer", "wire"], severity: "Medium" },
    { dept: "Parks, Gardens & Environment", keywords: ["park", "garden", "tree", "playground"], severity: "Low" },
    { dept: "Traffic & Transport", keywords: ["traffic", "signal", "parking", "bus stop", "footover bridge"], severity: "Medium" },
    { dept: "Public Health", keywords: ["mosquito", "disease", "outbreak", "epidemic", "hospital"], severity: "High" },
    { dept: "Building & Town Planning", keywords: ["illegal construction", "building violation", "unauthorized"], severity: "Medium" },
    { dept: "Animal Control (Stray Animals)", keywords: ["stray dog", "stray animal", "cattle", "monkey"], severity: "Medium" },
    { dept: "Fire Department", keywords: ["fire", "burning", "smoke"], severity: "High" },
    { dept: "Encroachment & Illegal Construction", keywords: ["encroachment", "footpath blocked", "illegal shop"], severity: "Medium" },
    { dept: "Public Toilets", keywords: ["toilet", "urinal", "public restroom"], severity: "Medium" },
    { dept: "Noise Pollution Control", keywords: ["noise", "loudspeaker", "loud music"], severity: "Low" },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return {
        issue: `${rule.dept.split(" (")[0]} - ${transcript.length > 50 ? transcript.slice(0, 50) + '...' : transcript}`,
        department: rule.dept,
        severity: rule.severity,
        confidence: 0.85,
        unclassified: false,
      };
    }
  }

  // Fallback if no specific department matched
  return {
    issue: transcript.length > 60 ? transcript.slice(0, 60) + "..." : transcript || "Civic grievance reported",
    department: "General Administration",
    severity: "Medium",
    confidence: 0.7,
    unclassified: false,
  };
}

// Simulates what the AI/NLP backend would return after processing
// speech-to-text + intent classification + NER

export function generateComplaintId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CG-${new Date().getFullYear()}-${rand}`;
}

export function mockTrackingTimeline() {
  return [
    { status: "Complaint Registered", done: true, time: "10:02 AM" },
    { status: "Assigned to Department", done: true, time: "10:15 AM" },
    { status: "Field Team Notified", done: true, time: "11:00 AM" },
    { status: "Under Resolution", done: false, time: "Pending" },
    { status: "Resolved", done: false, time: "Pending" },
  ];
}