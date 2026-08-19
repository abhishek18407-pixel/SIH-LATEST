const CLASSIFICATION_SYSTEM_PROMPT = `You are an AI assistant for a Civic Grievance Redressal system in India.
Citizens will report civic issues in various Indian regional languages (Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati, Malayalam, Punjabi, Odia, Urdu, Assamese) or English.

Analyze the user's grievance input and perform TWO key tasks:
1. TRANSLATE the core issue into a clear, professional English sentence for "summary".
2. ACCURATELY CLASSIFY the issue into the appropriate municipal department.

Output strictly a JSON object with these EXACT keys:
- "summary": A clear, concise English description of the exact core problem reported (e.g. "Hazardous deep pothole on main road causing accident risk", "Burst sewage pipeline flooding street and foul odor", "Streetlight broken creating unsafe dark area").
- "extracted_location": Street names, landmarks, pin codes, or locations mentioned. If none found, return "Not specified".
- "urgency": Categorize urgency into exactly one of: "Low", "Medium", "High", "Critical".
- "department": Categorize into exactly one of:
    - "Roads & Infrastructure (PWD)"
    - "Water Supply"
    - "Sewage & Drainage"
    - "Electricity / Street Lighting"
    - "Sanitation & Waste Management"
    - "Public Health"
    - "Parks, Gardens & Environment"
    - "Traffic & Transport"
    - "Animal Control (Stray Animals)"
    - "Public Toilets"
    - "General Administration"

Return strictly a valid JSON object matching this schema.`;

const MULTILINGUAL_DEPT_RULES = [
  {
    dept: "Roads & Infrastructure (PWD)",
    englishTemplate: "Hazardous pothole and road infrastructure damage reported",
    severity: "High",
    coreKeywords: [
      "pothole", "potholes", "crater", "craters", "broken road", "damaged road", "crack in road", "speed breaker", "divider broken", "footpath broken", "pavement broken",
      "गड्ढा", "गड्ढे", "गड्ढा है", "टूटी सड़क", "टूटा हुआ रोड", "सड़क खराब", "सड़क टूटी", "खराब सड़क", "डामर उखड़", "स्पीड ब्रेकर", "सड़क पर गड्ढा",
      "குழி", "குழிகள்", "சாலை பழுது", "சாலை சேதம்", "உடைந்த சாலை", "பள்ளம்",
      "గుంత", "గుంతలు", "పాడైన రోడ్డు", "రోడ్డు దెబ్బతింది", "రోడ్డుపై గుంతలు",
      "ಗುಂಡಿ", "ಗುಂಡಿಗಳು", "ಹಾಳಾದ ರಸ್ತೆ", "ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ", "ರಸ್ತೆ ಹಾನಿ",
      "खड्डा", "खड्डे", "रस्ता खराब", "तुटलेला रस्ता", "रस्त्यावर खड्डा",
      "গর্ত", "ভাঙা রাস্তা", "রাস্তার গর্ত", "বেহাল রাস্তা",
      "ખાડો", "ખાડા", "તૂટેલો રસ્તો", "રસ્તા પર ખાડા",
      "കുഴി", "കുഴികൾ", "റോഡ് തകർന്നു", "റോഡിലെ കുഴി",
      "ਖੱਡਾ", "ਖੱਡੇ", "ਟੁੱਟੀ ਸੜਕ", "ਸੜਕ ਤੇ ਖੱਡੇ",
      "ଖାଲ", "ଭଙ୍ଗା ରାସ୍ତା", "ରାସ୍ତାରେ ଖାଲ",
      "گڑھا", "گڑھے", "ٹوٹی سڑک", "سڑک پر گڑھے"
    ],
    secondaryKeywords: ["pavement", "footpath", "tar", "asphalt", "flyover", "bridge", "पुल", "फुटपाथ", "पदपथ", "நடைபாதை", "ఫుట్‌పాత్", "ಕಾಲುದಾರಿ", "पूल"]
  },
  {
    dept: "Sanitation & Waste Management",
    englishTemplate: "Uncollected garbage accumulation and street cleanliness issue",
    severity: "Medium",
    coreKeywords: [
      "garbage", "trash", "waste", "litter", "rubbish", "dustbin", "garbage dump", "dumping", "sweeping", "waste overflow", "uncleaned waste",
      "कचरा", "कचरे", "कूड़ा", "कूड़े", "गंदगी", "डस्टबिन", "कचरे का ढेर", "कूड़ेदान", "सफाई नहीं", "कूड़ादान", "झाड़ू नहीं", "कचरा पेटी",
      "குப்பை", "குப்பைகள்", "கழிவு", "குப்பைத்தொட்டி", "குப்பைக் குவியல்", "அசுத்தம்",
      "చెత్త", "చెత్తా చెదారం", "డస్ట్‌బిన్", "చెత్త కుప్ప", "చెత్త తీయలేదు", "పారిశుధ్యం",
      "ಕಸ", "ಕಸದ ರಾಶಿ", "ತ್ಯಾಜ್ಯ", "ಕಸದ ತೊಟ್ಟಿ", "ಸ್ವಚ್ಛತೆ ಇಲ್ಲ", "ಕಸ ತುಂಬಿದೆ",
      "कचरा", "कचऱ्याचा ढीग", "कचरा साचला", "डस्टबीन", "कचरा उचलला नाही", "घाण साचली",
      "আবর্জনা", "ময়লা", "ডাস্টবিন", "জঞ্জাল", "ময়লার স্তূপ", "আবর্জনার স্তূপ",
      "કચરો", "કચરાપેટી", "કચરાના ઢગલા", "ગંદકી ફેલાઈ",
      "മാലിന്യം", "ചപ്പുചവറുകൾ", "വേസ്റ്റ്", "ഡസ്റ്റ്ബിൻ", "മാലിന്യക്കൂമ്പാരം",
      "ਕੂੜਾ", "ਗੰਦਗੀ", "ਡਸਟਬਿਨ", "ਕੂੜੇ ਦਾ ਢੇਰ", "ਸਫਾਈ ਨਹੀਂ",
      "ଅଳିଆ", "ଆବର୍ଜନା", "ଡଷ୍ଟବିନ", "ମଇଳା ଜମା",
      "کچرا", "کوڑا", "کوڑے دان", "کوڑے کا ڈھیر", "صفائی نہیں"
    ],
    secondaryKeywords: ["filth", "debris", "plastic waste", "smell of garbage", "bad smell", "बदबूदार", "दुर्गंध", "துர்நாற்றம்", "దుర్వాసన"]
  },
  {
    dept: "Sewage & Drainage",
    englishTemplate: "Sewage overflow, clogged drain, or open manhole hazard",
    severity: "High",
    coreKeywords: [
      "sewage", "sewer", "drain", "drainage", "manhole", "gutter", "overflowing sewage", "clogged drain", "drain blocked", "gutter overflow", "septic tank",
      "नाली", "नाला", "सीवर", "मैनहोल", "गटर", "गंदा पानी", "जलभराव", "नाली बंद", "सीवेज", "गटर का पानी", "नाला जाम", "नाले का पानी",
      "கழிவுநீர்", "சாக்கடை", "மேன்ஹோல்", "கால்வாய் அடைப்பு", "சாக்கடை நீர்", "கழிவுநீர் தேக்கம்",
      "మురుగు", "డ్రైనేజీ", "మ్యాన్‌హோల్", "మురుగు కాలువ", "మురుగునీరు", "డ్రైన్ జామ్", "కాలువ పొంగి",
      "ಒಳಚರಂಡಿ", "ಚರಂಡಿ", "ಮ್ಯಾನ್‌ಹೋಲ್", "ಕೊಳಚೆ ನೀರು", "ಚರಂಡಿ ತುಂಬಿದೆ", "ಚರಂಡಿ ಬ್ಲಾಕ್",
      "सांडपाणी", "गटर", "मॅनहोल", "नाला", "घाण पाणी", "गटार तुंबले", "गटाराचे पाणी",
      "নর্দমা", "ম্যানহোল", "ড্রেন", "নোংরা জল", "নিকাশী সমস্যা", "ড্রেন বন্ধ",
      "ગટર", "નાળું", "મેનહોલ", "ગંદુ પાણી", "ગટર બ્લોક", "ગટર ઉભરાઈ",
      "ഡ്രെയിനേജ്", "അഴുക്കുചാൽ", "മാൻഹോൾ", "മലിനജലം", "ഡ്രെയിനേജ് ബ്ലോക്ക്",
      "ਗੰਦਾ ਪਾਣੀ", "ਨਾਲੀ", "ਸੀਵਰੇਜ", "ਗਟਰ", "ਜਾਮ ਨਾਲੀ",
      "ନର୍ଦ୍ଦମା", "ଡ୍ରେନ", "ମଇଳା ପାଣି", "ଡ୍ରେନେଜ",
      "گندا پانی", "نالی", "سیوریج", "گٹر", "بند نالی"
    ],
    secondaryKeywords: ["foul smell", "stagnant water", "choked", "कीचड़", "बदबू"]
  },
  {
    dept: "Water Supply",
    englishTemplate: "Water supply disruption, low pressure, or pipeline leakage",
    severity: "High",
    coreKeywords: [
      "drinking water", "water supply", "water leak", "pipeline leak", "pipe burst", "no water", "water shortage", "tap water", "water crisis", "tanker", "borewell",
      "पीने का पानी", "जल आपूर्ति", "पानी नहीं आ रहा", "पानी की समस्या", "पानी की किल्लत", "पाइपलाइन लीकेज", "पाइप फट", "पानी का प्रेशर", "नल में पानी नहीं", "जल संकट", "पानी बंद",
      "குடிநீர்", "தண்ணீர் இல்லை", "நீர் விநியோகம்", "குழாய் கசிவு", "நீர் தட்டுப்பாடு", "குடிநீர் பிரச்சனை",
      "తాగునీరు", "నీటి కొరత", "నీటి సరఫరా", "నీళ్లు రావడం లేదు", "పైప్‌లైన్ లీకేజీ", "నల్లా నీళ్లు",
      "ಕುಡಿಯುವ ನೀರು", "ನೀರಿಲ್ಲ", "ನೀರಿನ ಕೊರತೆ", "ನೀರಿನ ಸಮಸ್ಯೆ", "ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ", "ನಲ್ಲಿ ನೀರು",
      "पिण्याचे पाणी", "पाणी नाही", "पाणी टंचाई", "पाणी पुरवठा", "पाईपलाईन गळती", "नळाला पाणी नाही",
      "পানীয় জল", "জল নেই", "জলের সমস্যা", "জল সরবরাহ", "পাইপলাইন ফুটো", "নলের জল",
      "પીવાનું પાણી", "પાણી નથી", "પાણીની તંગી", "પાણી પુરવઠો", "પાઇપલાઇન લીકેજ",
      "കുടിവെള്ളം", "വെള്ളമില്ല", "കുടിവെള്ള ക്ഷാമം", "പൈപ്പ് ചോർച്ച",
      "ਪੀਣ ਵਾਲਾ ਪਾਣੀ", "ਪਾਣੀ ਨਹੀਂ", "ਪਾਣੀ ਦੀ ਕਿੱਲਤ", "ਪਾਈਪ ਲੀਕ",
      "ପିଇବା ପାଣି", "ପାଣି ନାହିଁ", "ଜଳ ଯୋଗାଣ", "ପାଇପ ଲିକ",
      "پینے کا پانی", "پانی کی قلت", "پانی نہیں آ رہا", "پائپ لائن رساؤ"
    ],
    secondaryKeywords: ["water", "tap", "pipeline", "motor", "tank", "पानी", "जल", "தண்ணீர்", "నీరు", "నీళ్లు", "ನೀರು", "पाणी", "জল", "પાણી", "വെള്ളം", "ਪਾਣੀ"]
  },
  {
    dept: "Electricity / Street Lighting",
    englishTemplate: "Streetlight fault, dangling wire, or power outage risk",
    severity: "Medium",
    coreKeywords: [
      "streetlight", "street light", "street lights", "power cut", "power outage", "dangling wire", "electric pole", "transformer spark", "load shedding", "blackout", "no electricity",
      "स्ट्रीटलाइट", "स्ट्रीट लाइट", "बिजली गुल", "बिजली नहीं है", "खंभा टूटा", "बिजली का तार", "ट्रांसफार्मर", "करंट लग सकता", "अंधेरा रहता", "बत्ती बंद", "लाइट बंद",
      "தெருவிளக்கு", "மின்வெட்டு", "மின் கம்பம்", "அறுந்த கம்பி", "விளக்கு எரியவில்லை", "இருட்டாக உள்ளது",
      "స్ట్రీట్‌లైట్", "కరెంట్ పోయింది", "కరెంట్ లేదు", "కరెంట్ స్తంభం", "విద్యుత్ తీగలు", "చీకటిగా ఉంది",
      "ಬೀದಿದೀಪ", "ಕರೆಂಟ್ ಇಲ್ಲ", "ವಿದ್ಯುತ್ ಕಂಬ", "ಕರೆಂಟ್ ತಂತಿ", "ದೀಪ ಉರಿಯುತ್ತಿಲ್ಲ", "ಕತ್ತಲೆಯಾಗಿದೆ",
      "पथदिवा", "वीज पुरवठा खंडित", "लाईट गेली", "लाईट बंद", "विजेचा खांब", "विजेची वायर", "खूप अंधार",
      "পথবাতি", "লোডশেডিং", "বিদ্যুৎ নেই", "বৈদ্যুতিক খুঁটি", "ছেঁড়া তার", "স্ট্রিট লাইট বন্ধ",
      "સ્ટ્રીટલાઇટ", "પાવર કટ", "વીજળી નથી", "થાંભલો", "વીજળી વાયર", "અંધારું છે",
      "തെരുവ് വിളക്ക്", "കറന്റ് ഇല്ല", "വൈദ്യുതി പോസ്റ്റ്", "കമ്പി പൊട്ടി", "വിളക്ക് കത്തുന്നില്ല",
      "ਸਟ੍ਰੀਟ ਲਾਈਟ", "ਬਿਜਲੀ ਬੰਦ", "ਬਿਜਲੀ ਖੰਭਾ", "ਤਾਰ ਟੁੱਟੀ", "ਹਨੇਰਾ ਹੈ",
      "ଷ୍ଟ୍ରିଟ ଲାଇଟ", "ବିଦ୍ୟୁତ ନାହିଁ", "ଖୁଣ୍ଟ", "ଛିଣ୍ଡା ତାର",
      "اسٹریٹ لائٹ", "بجلی بند", "بجلی کا پول", "ٹوٹی تار", "اندھیرا ہے"
    ],
    secondaryKeywords: ["electric", "power", "wire", "pole", "light", "spark", "voltage", "बिजली", "करंट", "மின்சாரம்", "విద్యుత్", "ವಿದ್ಯುತ್", "वीज", "বিদ্যুৎ", "વીજળી", "വൈദ്യുതി", "ਬਿਜਲੀ"]
  },
  {
    dept: "Public Health",
    englishTemplate: "Mosquito breeding, vector disease outbreak, or public health hazard",
    severity: "High",
    coreKeywords: [
      "mosquito", "mosquitoes", "dengue", "malaria", "chikungunya", "disease outbreak", "fogging required", "mosquito breeding", "dead animal", "carcass",
      "मच्छर", "मच्छरों", "डेंगू", "मलेरिया", "बीमारी फैल", "फॉगिंग", "दवा का छिड़काव", "मरा हुआ जानवर", "मृत पशु",
      "கொசு", "கொசுக்கள்", "டெங்கு", "மலேரியா", "நோய் பரவல்", "கொசு மருந்து", "இறந்த விலங்கு",
      "దోమలు", "డెంగ్యూ", "మలేరియా", "వ్యాధులు", "ఫాగింగ్", "దోమల బెడద", "చనిపోయిన జంతువు",
      "ಸೊಳ್ಳೆ", "ಸೊಳ್ಳೆಗಳು", "ಡೆಂಗ್ಯೂ", "ಮಲೇರಿಯಾ", "ರೋಗ ಹರಡುವಿಕೆ", "ಫಾಗಿಂಗ್", "ಸತ್ತ ಪ್ರಾಣಿ",
      "डास", "डासांचा प्रादुर्भाव", "डेंग्यू", "मलेरिया", "आजार पसरतोय", "फवारणी", "मेलेला प्राणी",
      "মশা", "মশার উপদ্রব", "ডেঙ্গু", "ম্যালেরিয়া", "মৃত পশু",
      "મચ્છર", "ડેન્ગ્યુ", "મેલેરિયા", "દવા છંટકાવ", "મૃત પ્રાણી",
      "കൊതുക്", "ഡെങ്കിപ്പനി", "മലേറിയ", "കൊതുക് ശല്യം", "ചത്ത മൃഗം",
      "ਮੱਛਰ", "ਡੇਂਗੂ", "ਮਲੇਰੀਆ", "ਮੱਛਰਾਂ ਦੀ ਭਰਮਾਰ",
      "ମଶା", "ଡେଙ୍ଗୁ", "ମ୍ୟାଲେରିଆ", "ମଲା ଜନ୍ତୁ",
      "مچھر", "ڈینگی", "ملیریا", "مردہ جانور"
    ],
    secondaryKeywords: ["hospital", "epidemic", "clinic", "health risk", "स्वास्थ्य", "रोग", "மருத்துவமனை", "ఆసుపత్రి"]
  }
];

async function translateToEnglish(text) {
  if (!text || !text.trim()) return "";
  const isAsciiOnly = /^[\x00-\x7F\s.,!?'"()-]+$/.test(text);
  if (!isAsciiOnly) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map(item => item[0]).filter(Boolean).join(" ").trim();
          if (translated) return translated;
        }
      }
    } catch {}
  }
  return text;
}

function scoreDepartments(originalText, translatedText) {
  const combined = ((originalText || "") + " " + (translatedText || "")).toLowerCase();
  let bestDept = "General Administration";
  let bestScore = 0;
  let bestRule = null;

  for (const rule of MULTILINGUAL_DEPT_RULES) {
    let score = 0;
    for (const kw of rule.coreKeywords) {
      if (combined.includes(kw.toLowerCase())) score += 10;
    }
    for (const kw of (rule.secondaryKeywords || [])) {
      if (combined.includes(kw.toLowerCase())) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestDept = rule.dept;
      bestRule = rule;
    }
  }

  return { dept: bestDept, score: bestScore, rule: bestRule };
}

async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === "object") {
      if (req.body.text) return req.body.text;
    }
    if (typeof req.body === "string") {
      try {
        const parsed = JSON.parse(req.body);
        if (parsed.text) return parsed.text;
      } catch {
        if (req.body.startsWith("text=")) {
          return decodeURIComponent(req.body.replace(/^text=/, "").replace(/\+/g, " "));
        }
        return req.body;
      }
    }
  }

  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed.text || data);
      } catch {
        if (data.includes("name=\"text\"")) {
          const match = data.match(/name="text"[\r\n]+([^\r\n]+)/);
          if (match && match[1]) {
            return resolve(match[1].trim());
          }
        }
        if (data.startsWith("text=")) {
          return resolve(decodeURIComponent(data.replace(/^text=/, "").replace(/\+/g, " ")));
        }
        resolve(data);
      }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      endpoint: "/api/analyze",
      groq_configured: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_your"))
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawText = await parseBody(req);
    const text = typeof rawText === "string" ? rawText.trim() : "";

    if (!text) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-8b-8192", "gemma2-9b-it"];

    if (apiKey && !apiKey.startsWith("gsk_your")) {
      for (const model of models) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: CLASSIFICATION_SYSTEM_PROMPT },
                { role: "user", content: `Grievance Text (Translate to English & Classify):\n${text}` }
              ],
              response_format: { type: "json_object" },
              temperature: 0.1
            })
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) {
              const parsed = JSON.parse(content);
              if (parsed.summary && parsed.department && parsed.department !== "General Administration") {
                return res.status(200).json({
                  success: true,
                  summary: parsed.summary,
                  department: parsed.department,
                  severity: parsed.urgency || "Medium",
                  extracted_location: parsed.extracted_location || "Not specified"
                });
              }
            }
          }
        } catch (err) {
          console.warn(`Groq model ${model} failed, trying next fallback:`, err);
        }
      }
    }

    // Multilingual scored fallback classification with English translation
    let englishText = "";
    try {
      englishText = await translateToEnglish(text);
    } catch {}

    const { dept, rule } = scoreDepartments(text, englishText);
    const finalSeverity = rule ? rule.severity : "Medium";
    let summary = "";

    if (englishText && englishText.trim() && englishText !== text) {
      summary = englishText.length > 140 ? englishText.slice(0, 140) + "..." : englishText;
    } else if (rule) {
      summary = `${rule.englishTemplate}: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`;
    } else {
      summary = englishText || (text.length > 80 ? text.slice(0, 80) + "..." : text || "Civic grievance reported");
    }

    return res.status(200).json({
      success: true,
      summary: summary,
      department: dept,
      severity: finalSeverity,
      extracted_location: "Not specified"
    });

  } catch (error) {
    console.error("Analysis handler error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}
