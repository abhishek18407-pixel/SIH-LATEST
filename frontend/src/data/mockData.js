// Multilingual AI Classification and English Translation Engine for Indian Municipalities

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
  { code: "as", label: "Assamese", native: "অসমীया" },
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
      "మురుగు", "డ్రైనేజీ", "మ్యాన్‌హోల్", "మురుగు కాలువ", "మురుగునీరు", "డ్రైన్ జామ్", "కాలువ పొంగి",
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
  },
  {
    dept: "Parks, Gardens & Environment",
    englishTemplate: "Fallen tree, overgrown vegetation, or park maintenance issue",
    severity: "Low",
    coreKeywords: [
      "fallen tree", "tree branch broken", "tree fell", "park broken", "garden maintenance", "overgrown weeds", "playground broken",
      "गिरा हुआ पेड़", "पेड़ गिर गया", "पेड़ की डाल टूट", "पार्क की सफाई", "बगीचा खराब", "घास बहुत बढ़",
      "விழுந்த மரம்", "மரம் முறிந்து", "பூங்கா பராமரிப்பு",
      "పడిపోయిన చెట్టు", "చెట్టు కొమ్మ విరిగింది", "పార్కు నిర్వహణ",
      "ಬಿದ್ದ ಮರ", "ಮರದ ಕೊಂಬೆ ಮುರಿದಿದೆ", "ಉದ್ಯಾನವನ",
      "पडलेले झाड", "झाडाची फांदी तुटली", "उद्यान देखभाल",
      "গাছ ভেঙে পড়েছে", "গাছের ডাল", "পার্কের বেহাল অবস্থা",
      "પડેલું વૃક્ષ", "ઝાડની ડાળી તૂટી",
      "മരം വീണു", "മരക്കൊമ്പ് ഒടിഞ്ഞു",
      "ਡਿੱਗਿਆ ਰੁੱਖ", "ਦਰੱਖਤ ਟੁੱਟਿਆ",
      "ଗଛ ପଡ଼ିଯାଇଛି", "ଗଛ ଡାଳ ଭାଙ୍ଗିଛି",
      "گرا ہوا درخت", "درخت کی شاخ ٹوٹی"
    ],
    secondaryKeywords: ["park", "garden", "tree", "plant", "greenery", "पार्क", "बगीचा", "पेड़", "பூங்கா", "மரம்", "పార్కు", "చెట్టు", "ಮರ", "झाड"]
  },
  {
    dept: "Traffic & Transport",
    englishTemplate: "Traffic congestion, broken traffic light, or parking obstruction",
    severity: "Medium",
    coreKeywords: [
      "traffic jam", "traffic signal broken", "traffic light not working", "illegal parking blocked", "bus stop damaged", "zebra crossing missing",
      "ट्रैफिक जाम", "ट्रैफिक सिग्नल खराब", "लाल बत्ती खराब", "अवैध पार्किंग", "बस स्टॉप टूटा", "रास्ता जाम",
      "போக்குவரத்து நெரிசல்", "சிக்னல் பழுது", "சிக்னல் வேலை செய்யவில்லை",
      "ట్రాఫిక్ జామ్", "ట్రాఫిక్ సిగ్నల్ పాడైంది", "సిగ్నల్ పని చేయడం లేదు",
      "ಸಂಚಾರ ದಟ್ಟಣೆ", "ಟ್ರಾಫಿಕ್ ಜಾಮ್", "ಸಿಗ್ನಲ್ ಕೆಟ್ಟಿದೆ",
      "वाहतूक कोंडी", "ट्रॅफिक सिग्नल खराब", "सिग्नल बंद",
      "ট্রাফিক জ্যাম", "সিগন্যাল নষ্ট",
      "ટ્રાફિક જામ", "સિગ્નલ બંધ",
      "ട്രാഫിക് ബ്ലോക്ക്", "സിഗ്നൽ തകരാർ",
      "ਟ੍ਰੈਫਿਕ ਜਾਮ", "ਸਿਗਨਲ ਖਰਾਬ",
      "ଟ୍ରାଫିକ ଜାମ", "ସିଗନାଲ ଖରାପ",
      "ٹریفک جام", "سگنل خراب"
    ],
    secondaryKeywords: ["traffic", "signal", "bus stop", "parking", "ट्रैफिक", "सिग्नल", "நெரிசல்", "జామ్", "कोंडी"]
  },
  {
    dept: "Animal Control (Stray Animals)",
    englishTemplate: "Stray animal menace or aggressive animals in residential area",
    severity: "Medium",
    coreKeywords: [
      "stray dog", "stray dogs", "dog bite", "dog menace", "monkey menace", "stray cattle", "stray cows", "bull on road", "rabies risk",
      "आवारा कुत्ता", "आवारा कुत्ते", "कुत्ते काट रहे", "कुत्तों का आतंक", "बंदरों का आतंक", "आवारा पशु", "गाय भैंस सड़क पर",
      "தெரு நாய்", "தெரு நாய்கள்", "நாய் கடி", "குரங்கு தொல்லை", "தெரு மாடுகள்",
      "వీధి కుక్కలు", "కుక్క కాటు", "కోతుల బెడద", "వీధి పశువులు",
      "ಬೀದಿ ನಾಯಿ", "ಬೀದಿ ನಾಯಿಗಳು", "ನಾಯಿ ಕಡಿತ", "ಮಂಗಗಳ ಕಾಟ", "ಬೀದಿ ಹಸುಗಳು",
      "भटकी कुत्री", "कुत्रा चावला", "माकडांचा त्रास", "भटकी जनावरे",
      "বেওয়ারিশ কুকুর", "কুকুরের উপদ্রব", "বানরের উপদ্রব",
      "રખડતા કૂતરા", "કૂતરાનો ત્રાસ", "વાંદરાનો ત્રાસ", "રખડતા ઢોર",
      "തെരുവ് നായ", "നായ്ക്കളുടെ ശല്യം", "കുരങ്ങ് ശല്യം",
      "ਅਵਾਰਾ ਕੁੱਤੇ", "ਕੁੱਤਿਆਂ ਦੀ ਦਹਿਸ਼ਤ", "ਬਾਂਦਰਾਂ ਦਾ ਤਾਂਡਵ",
      "ବୁଲା କୁକୁର", "କୁକୁର କାମୁଡ଼ା", "ମାଙ୍କଡ଼ ଉପଦ୍ରବ",
      "آوارہ کتے", "کتوں کی دہشت", "بندروں کی دہشت"
    ],
    secondaryKeywords: ["dog", "monkey", "cattle", "cow", "कुत्ता", "बंदर", "गाय", "நாய்", "కుక్క", "ನಾಯಿ", "कुत्रा"]
  },
  {
    dept: "Public Toilets",
    englishTemplate: "Unsanitary or non-operational public toilet facility",
    severity: "Medium",
    coreKeywords: [
      "public toilet", "public urinal", "public restroom", "toilet dirty", "toilet broken", "toilet choked",
      "सार्वजनिक शौचालय", "सुलभ शौचालय", "पेशाबघर", "शौचालय गंदा", "शौचालय बंद", "टॉयलेट खराब",
      "பொது கழிப்பறை", "கழிப்பறை பராமரிப்பு இல்லை",
      "బహిరంగ మరుగుదొడ్డి", "మరుగుదొడ్డి పాడైంది",
      "ಸಾರ್ವಜನಿಕ ಶೌಚಾಲಯ", "ಶೌಚಾಲಯ ಕೊಳಕು",
      "सार्वजनिक शौचालय", "स्वच्छतागृह घाण",
      "পাবলিক টয়লেট", "শৌচাগার নোংরা",
      "જાહેર શૌચાલય", "શૌચાલય ગંદુ",
      "പൊതു ശൗചാലയം",
      "ਜਨਤਕ ਪਖਾਨਾ",
      "ସର୍ବସାଧାରଣ ଶୌଚାଳୟ",
      "پبلک ٹوائلٹ", "بیت الخلاء گندا"
    ],
    secondaryKeywords: ["toilet", "urinal", "washroom", "शौचालय", "கழிப்பறை", "మరుగుదొడ్డి", "ಶೌಚಾಲಯ"]
  }
];

// Helper: Translates text from any language into English using Google Translate free API
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

// Scored classification engine that inspects both original text and English translation
export function scoreDepartments(originalText, translatedText) {
  const combined = ((originalText || "") + " " + (translatedText || "")).toLowerCase();
  
  let bestDept = "General Administration";
  let bestScore = 0;
  let bestRule = null;

  for (const rule of MULTILINGUAL_DEPT_RULES) {
    let score = 0;

    // High-priority core problem keywords (Weight: 10)
    for (const kw of rule.coreKeywords) {
      if (combined.includes(kw.toLowerCase())) {
        score += 10;
      }
    }

    // Secondary keywords (Weight: 2)
    for (const kw of (rule.secondaryKeywords || [])) {
      if (combined.includes(kw.toLowerCase())) {
        score += 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestDept = rule.dept;
      bestRule = rule;
    }
  }

  return { dept: bestDept, score: bestScore, rule: bestRule };
}

// AI / NLP analyzer: processes regional language text, assigns department, and produces English summary
export async function mockAIAnalyze(transcript) {
  const raw = (transcript || "").trim();

  // 1. Translate non-English input to English
  let englishText = "";
  try {
    englishText = await translateToEnglish(raw);
  } catch {}

  // 2. Score departments across both original language and English translation
  const { dept, rule } = scoreDepartments(raw, englishText);
  const finalDept = dept;
  const finalSeverity = rule ? rule.severity : "Medium";
  let finalSummary = "";

  if (englishText && englishText.trim() && englishText !== raw) {
    finalSummary = englishText.length > 140 ? englishText.slice(0, 140) + "..." : englishText;
  } else if (rule) {
    finalSummary = `${rule.englishTemplate}: "${raw.slice(0, 60)}${raw.length > 60 ? '...' : ''}"`;
  } else {
    finalSummary = englishText || (raw.length > 80 ? raw.slice(0, 80) + "..." : raw || "Civic grievance reported");
  }

  return {
    issue: finalSummary,
    department: finalDept,
    severity: finalSeverity,
    confidence: rule ? 0.95 : 0.7,
    unclassified: false,
  };
}

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