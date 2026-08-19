// Mock data and AI classification engine with full Indian regional language support

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

export const MULTILINGUAL_DEPT_RULES = [
  {
    dept: "Roads & Infrastructure (PWD)",
    englishTemplate: "Hazardous pothole and road infrastructure damage reported",
    severity: "High",
    keywords: [
      "pothole", "potholes", "road", "roads", "footpath", "pavement", "bridge", "crack", "tar", "asphalt", "crater", "speed breaker", "broken road", "divider",
      "गड्ढा", "गड्ढे", "सड़क", "रास्ता", "फुटपाथ", "पुल", "मार्ग", "रोड", "डामर", "टूटी सड़क", "खराब सड़क", "गड्ढा है", "स्पीड ब्रेकर", "सड़क",
      "குழி", "குழிகள்", "சாலை", "நடைபாதை", "பாலம்", "தெரு", "தார்", "பழுது", "சாலை சேதம்",
      "గుంత", "గుంతలు", "రోడ్డు", "రహదారి", "ఫుట్‌పాత్", "వంతెన", "వీధి", "పాడైన రోడ్డు",
      "ಗುಂಡಿ", "ಗುಂಡಿಗಳು", "ರಸ್ತೆ", "ಕಾಲುದಾರಿ", "ಸೇತುವೆ", "ಬೀದಿ", "ಹಾಳಾದ ರಸ್ತೆ", "ತಗ್ಗು",
      "खड्डा", "खड्डे", "रस्ता", "पदपथ", "पूल", "गल्ली", "डांबरी", "रस्ता खराब",
      "গর্ত", "রাস্তা", "ফুটপাত", "সেতু", "সড়ক", "ভাঙা রাস্তা",
      "ખાડો", "ખાડા", "રસ્તો", "પુલ", "ગલી", "ફૂટપાથ", "તૂટેલો રસ્તો",
      "കുഴി", "കുഴികൾ", "റോഡ്", "നടപ്പാത", "പാലം", "തെരുവ്",
      "ਖੱਡਾ", "ਖੱਡੇ", "ਸੜਕ", "ਰਸਤਾ", "ਪੁਲ", "ਫੁੱਟਪਾਥ",
      "ଖାଲ", "ରାସ୍ତା", "ଫୁଟପାଥ", "ପୋଲ",
      "گڑھا", "گڑھے", "سڑک", "राستہ", "پل", "فٹ پاتھ"
    ]
  },
  {
    dept: "Water Supply",
    englishTemplate: "Water supply disruption, low pressure, or pipeline leakage",
    severity: "High",
    keywords: [
      "water", "tap", "pipeline", "pipe leak", "pipe burst", "drinking water", "water supply", "no water", "water shortage", "tank", "motor", "borewell", "low pressure",
      "पानी", "नल", "पाइपलाइन", "लीकेज", "पीने का पानी", "जल", "जल आपूर्ति", "पानी नहीं", "पानी की समस्या", "टंकी", "पाइप फट",
      "தண்ணீர்", "குழாய்", "கசிவு", "குடிநீர்", "தண்ணீர் இல்லை", "நீர் விநியோகம்",
      "నీరు", "నీళ్లు", "నల్లా", "పైప్‌లైన్", "లీకేజీ", "తాగునీరు", "నీటి కొరత", "నీటి సరఫరా",
      "ನೀರು", "ನಲ್ಲಿ", "ಪೈಪ್‌ಲೈನ್", "ಸೋರಿಕೆ", "ಕುಡಿಯುವ ನೀರು", "ನೀರಿಲ್ಲ", "ನೀರಿನ ಕೊರತೆ",
      "पाणी", "नळ", "पाईपलाईन", "गळती", "पिण्याचे पाणी", "पाणी नाही", "पाणी टंचाई",
      "জল", "নল", "পাইপলাইন", "ফুটো", "পানীয় জল", "জল নেই",
      "પાણી", "નળ", "પાઇપલાઇન", "લીકેજ", "પીવાનું પાણી", "પાણી નથી",
      "വെള്ളം", "പൈപ്പ്", "ചോർച്ച", "കുടിവെള്ളം", "വെള്ളമില്ല",
      "ਪਾਣੀ", "ਨਲਕਾ", "ਪਾਈਪ", "ਲੀਕ", "ਪੀਣ ਵਾਲਾ ਪਾਣੀ", "ਪਾਣੀ ਨਹੀਂ",
      "ପାଣି", "ନଳ", "ପାଇପ", "ପିଇବା ପାଣି",
      "پانی", "نل", "پائپ لائن", "رساؤ", "پینے کا پانی"
    ]
  },
  {
    dept: "Sewage & Drainage",
    englishTemplate: "Sewage overflow, clogged drain, or open manhole hazard",
    severity: "High",
    keywords: [
      "sewage", "sewer", "drain", "drainage", "manhole", "gutter", "overflow", "clogged", "dirty water", "foul smell", "stagnant water", "choked",
      "नाली", "नाला", "सीवर", "मैनहोल", "गटर", "गंदा पानी", "जलभराव", "बदबू", "जाम", "कीचड़", "नाली बंद", "सीवेज",
      "கழிவுநீர்", "சாக்கடை", "மேன்ஹோல்", "கால்வாய்", "அடைப்பு", "துர்நாற்றம்",
      "మురుగు", "డ్రైనేజీ", "మ్యాన్‌హோல்", "కాలువ", "మురుగునీరు", "దుర్వాసన", "జామ్",
      "ಒಳಚರಂಡಿ", "ಚರಂಡಿ", "ಮ್ಯಾನ್‌ಹೋಲ್", "ಕೊಳಚೆ ನೀರು", "ದುರ್ವಾಸನೆ", "ಬ್ಲಾಕ್",
      "सांडपाणी", "गटर", "मॅनहोल", "नाला", "घाण पाणी", "दुर्गंधी", "तुंबले",
      "নর্দমা", "ম্যানহোল", "ড্রেন", "নোংরা জল", "দুর্গন্ধ", "ড্রেনেজ",
      "ગટર", "નાળું", "મેનહોલ", "ગંદુ પાણી", "દુર્ગંધ", "ભરાયેલું પાણી",
      "ഡ്രെയിനേജ്", "അഴുക്കുചാൽ", "മാൻഹോൾ", "മലിനജലം",
      "ਗੰਦਾ ਪਾਣੀ", "ਨਾਲੀ", "ਸੀਵਰੇਜ", "ਗਟਰ", "ਬਦਬੂ",
      "ନର୍ଦ୍ଦମା", "ଡ୍ରେନ", "ମଇଳା ପାଣି",
      "گندا پانی", "نالی", "سیوریج", "گٹر", "بدبو"
    ]
  },
  {
    dept: "Sanitation & Waste Management",
    englishTemplate: "Uncollected garbage accumulation and street cleanliness issue",
    severity: "Medium",
    keywords: [
      "garbage", "trash", "waste", "dump", "dustbin", "litter", "debris", "refuse", "sweeping", "plastic waste", "filth",
      "कचरा", "कूड़ा", "गंदगी", "डस्टबिन", "कचरे का ढेर", "सफाई", "कूड़ेदान", "बदबूदार कूड़ा", "कूड़ादान", "झाड़ू",
      "குப்பை", "கழிவு", "குப்பைத்தொட்டி", "அசுத்தம்", "துப்புரவு",
      "చెత్త", "వ్యర్థాలు", "డస్ట్‌బిన్", "చెత్త కుప్ప", "పారిశుధ్యం",
      "ಕಸ", "ತ್ಯಾಜ್ಯ", "ಕಸದ ತೊಟ್ಟಿ", "ಕೊಳಕು", "ಸ್ವಚ್ಛತೆ",
      "कचरा", "कचऱ्याचा ढीग", "डस्टबीन", "घाण", "स्वच्छता",
      "আবর্জনা", "ময়লা", "ডাস্টবিন", "জঞ্জাল", "পরিষ্কার",
      "કચરો", "કચરાપેટી", "ગંદકી", "સફાઈ",
      "മാലിന്യം", "ചപ്പുചവറുകൾ", "വേസ്റ്റ്", "ഡസ്റ്റ്ബിൻ",
      "ਕੂੜਾ", "ਗੰਦਗੀ", "ਡਸਟਬਿਨ", "ਸਫਾਈ",
      "ଅଳିଆ", "ଆବର୍ଜନା", "ଡଷ୍ଟବିନ",
      "کچرا", "کوڑا", "گندگی", "کوڑے دان", "صفائی"
    ]
  },
  {
    dept: "Electricity / Street Lighting",
    englishTemplate: "Streetlight fault, dangling wire, or power outage risk",
    severity: "Medium",
    keywords: [
      "light", "streetlight", "street light", "electric", "power", "wire", "pole", "transformer", "spark", "dark", "voltage", "blackout",
      "बिजली", "स्ट्रीटलाइट", "लाइट", "खंभा", "तार", "ट्रांसफार्मर", "करंट", "अंधेरा", "बिजली गुल", "बत्ती", "स्ट्रीट लाइट बंद",
      "மின்சாரம்", "தெருவிளக்கு", "விளக்கு", "கம்பம்", "கம்பி", "மின்வெட்டு", "இருட்டு",
      "విద్యుత్", "స్ట్రీట్‌లైట్", "లైట్", "స్తంభం", "వైరు", "ట్రాన్స్‌ఫార్మర్", "కరెంట్ పోయింది", "చీకటి",
      "ವಿದ್ಯುತ್", "ಬೀದಿದೀಪ", "ಲೈಟ್", "ಕಂಬ", "ತಂತಿ", "ಕರೆಂಟ್ ಇಲ್ಲ", "ಕತ್ತಲೆ",
      "वीज", "पथदिवा", "लाईट", "खांब", "वायर", "ट्रान्सफॉर्मर", "वीज पुरवठा खंडित", "अंधार",
      "বিদ্যুৎ", "পথবাতি", "লাইট", "খুঁটি", "তার", "ট্রান্সফরমার", "লোডশেডিং", "অন্ধকার",
      "વીજળી", "સ્ટ્રીટલાઇટ", "લાઈટ", "થાંભલો", "વાયર", "અંધારું", "પાવર કટ",
      "വൈദ്യുതി", "തെരുവ് വിളക്ക്", "പോസ്റ്റ്", "കമ്പി", "കറന്റ് ഇല്ല",
      "ਬਿਜਲੀ", "ਸਟ੍ਰੀਟ ਲਾਈਟ", "ਖੰਭਾ", "ਤਾਰ", "ਹਨੇਰਾ",
      "ବିଦ୍ୟୁତ", "ଷ୍ଟ୍ରିଟ ଲାଇଟ", "ଖୁଣ୍ଟ", "ତାର",
      "بجلی", "اسٹریٹ لائٹ", "پول", "تار", "اندھیرا"
    ]
  },
  {
    dept: "Public Health",
    englishTemplate: "Mosquito breeding, vector disease outbreak, or public health hazard",
    severity: "High",
    keywords: [
      "mosquito", "dengue", "malaria", "disease", "health", "hospital", "medicine", "fogging", "epidemic", "stagnant", "dead animal",
      "मच्छर", "डेंगू", "मलेरिया", "बीमारी", "स्वास्थ्य", "अस्पताल", "दवाई", "छिड़काव", "फॉगिंग", "मृत पशु",
      "கொசு", "டெங்கு", "மலேரியா", "நோய்", "சுகாதாரம்", "மருத்துவமனை",
      "దోమలు", "డెంగ్యూ", "మలేరియా", "వ్యాధి", "ఆరోగ్యం", "ఆసుపత్రి", "ఫాగింగ్",
      "ಸೊಳ್ಳೆ", "ಡೆಂಗ್ಯೂ", "ಮಲೇರಿಯಾ", "ರೋಗ", "ಆರೋಗ್ಯ", "ಆಸ್ಪತ್ರೆ", "ಫಾಗಿಂಗ್",
      "डास", "डेंग्यू", "मलेरिया", "आजार", "आरोग्य", "रुग्णालय", "फवारणी",
      "মশা", "ডেঙ্গু", "ম্যালেরিয়া", "রোগ", "স্বাস্থ্য", "হাসপাতাল",
      "મચ્છર", "ડેન્ગ્યુ", "મેલેરિયા", "રોગ", "આરોગ્ય", "દવા છંટકાવ",
      "കൊതുക്", "ഡെങ്കിപ്പനി", "മലേറിയ", "രോഗം", "ആരോഗ്യം",
      "ਮੱਛਰ", "ਡੇਂਗੂ", "ਮਲੇਰੀਆ", "ਬਿਮਾਰੀ", "ਸਿਹਤ",
      "ମଶା", "ଡେଙ୍ଗୁ", "ମ୍ୟାଲେରିଆ", "ରୋଗ", "ସ୍ୱାସ୍ଥ୍ୟ",
      "مچھر", "ڈینگی", "ملیریا", "بیماری", "صحت"
    ]
  }
];

export async function translateToEnglish(text) {
  if (!text || !text.trim()) return "";
  const isAsciiOnly = /^[\x00-\x7F\s.,!?'"()-]+$/.test(text);
  if (!isAsciiOnly) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map((item) => item[0]).filter(Boolean).join(" ").trim();
          if (translated) return translated;
        }
      }
    } catch {}
  }
  return text;
}

export async function mockAIAnalyze(transcript) {
  const raw = (transcript || "").trim();
  const textLower = raw.toLowerCase();

  let matchedRule = null;
  for (const rule of MULTILINGUAL_DEPT_RULES) {
    if (rule.keywords.some((kw) => textLower.includes(kw.toLowerCase()))) {
      matchedRule = rule;
      break;
    }
  }

  let englishText = "";
  try {
    englishText = await translateToEnglish(raw);
  } catch {}

  const finalDept = matchedRule ? matchedRule.dept : "General Administration";
  const finalSeverity = matchedRule ? matchedRule.severity : "Medium";
  let finalSummary = "";

  if (englishText && englishText.trim() && englishText !== raw) {
    finalSummary = englishText.length > 140 ? englishText.slice(0, 140) + "..." : englishText;
  } else if (matchedRule) {
    finalSummary = `${matchedRule.englishTemplate}: "${raw.slice(0, 60)}${raw.length > 60 ? '...' : ''}"`;
  } else {
    finalSummary = englishText || (raw.length > 80 ? raw.slice(0, 80) + "..." : raw || "Civic grievance reported");
  }

  return {
    issue: finalSummary,
    department: finalDept,
    severity: finalSeverity,
    confidence: matchedRule ? 0.95 : 0.7,
    unclassified: false,
  };
}

export function generateComplaintId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CG-${new Date().getFullYear()}-${rand}`;
}