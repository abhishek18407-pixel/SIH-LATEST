const CLASSIFICATION_SYSTEM_PROMPT = `You are an AI assistant for a Civic Grievance Redressal system.
Analyze the user's civic grievance input and extract structured information into a JSON object.

Output MUST contain the following keys:
- "summary": A clear, concise English description of the EXACT core civic problem/issue reported (e.g. "Hazardous deep pothole on MG Road near Trinity Metro Station", "Burst sewage pipeline flooding street", "Streetlight broken on 4th Cross").
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
    - "General Administration"

Return strictly a valid JSON object matching this schema.`;

function fallbackClassify(text) {
  const textLower = (text || "").toLowerCase();
  let dept = "General Administration";
  let severity = "Medium";

  if (["pothole", "road", "footpath", "pavement", "bridge", "street", "tarmac"].some(k => textLower.includes(k))) {
    dept = "Roads & Infrastructure (PWD)";
    severity = "High";
  } else if (["drain", "sewage", "manhole", "overflow", "gutter", "clog"].some(k => textLower.includes(k))) {
    dept = "Sewage & Drainage";
    severity = "High";
  } else if (["water", "leak", "pipeline", "tap", "drinking water", "supply"].some(k => textLower.includes(k))) {
    dept = "Water Supply";
    severity = "High";
  } else if (["garbage", "trash", "waste", "dump", "dustbin", "smell", "debris"].some(k => textLower.includes(k))) {
    dept = "Sanitation & Waste Management";
    severity = "Medium";
  } else if (["light", "streetlight", "electric", "power", "wire", "pole", "transformer", "spark"].some(k => textLower.includes(k))) {
    dept = "Electricity / Street Lighting";
    severity = "Medium";
  } else if (["mosquito", "dengue", "disease", "health", "hospital", "stray", "rabies"].some(k => textLower.includes(k))) {
    dept = "Public Health";
    severity = "High";
  } else if (["park", "tree", "fallen tree", "branch", "garden", "greenery"].some(k => textLower.includes(k))) {
    dept = "Parks, Gardens & Environment";
    severity = "Medium";
  } else if (["traffic", "signal", "jam", "bus stop", "parking"].some(k => textLower.includes(k))) {
    dept = "Traffic & Transport";
    severity = "Medium";
  }

  return {
    summary: text.length > 120 ? text.substring(0, 120) + "..." : text,
    department: dept,
    urgency: severity,
    extracted_location: "Not specified"
  };
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
        // May be form urlencoded or raw string
        if (req.body.startsWith("text=")) {
          return decodeURIComponent(req.body.replace(/^text=/, "").replace(/\+/g, " "));
        }
        return req.body;
      }
    }
  }

  // Read stream if body wasn't pre-parsed
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
          // Extract from multipart
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
  // Set CORS headers
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
                { role: "user", content: `Grievance Text:\n${text}` }
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
              return res.status(200).json({
                success: true,
                summary: parsed.summary || text,
                department: parsed.department || "Roads & Infrastructure (PWD)",
                severity: parsed.urgency || "Medium",
                extracted_location: parsed.extracted_location || "Not specified"
              });
            }
          }
        } catch (err) {
          console.warn(`Groq model ${model} failed, trying next fallback:`, err);
        }
      }
    }

    // Fallback keyword classification
    const fallback = fallbackClassify(text);
    return res.status(200).json({
      success: true,
      summary: fallback.summary,
      department: fallback.department,
      severity: fallback.urgency,
      extracted_location: fallback.extracted_location
    });

  } catch (error) {
    console.error("Analysis handler error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
}
