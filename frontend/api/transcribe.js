export const config = {
  api: {
    bodyParser: false,
  },
};

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
      endpoint: "/api/transcribe",
      groq_configured: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_your"))
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith("gsk_your")) {
    return res.status(200).json({
      success: false,
      message: "GROQ_API_KEY not configured on server. Please use text or browser speech recognition."
    });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const contentType = req.headers["content-type"] || "audio/webm";

    const blob = new Blob([buffer], { type: contentType.split(";")[0] });
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("response_format", "json");

    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/translations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      body: formData
    });

    if (groqRes.ok) {
      const groqData = await groqRes.json();
      return res.status(200).json({
        success: true,
        text: groqData.text || "",
        english_text: groqData.text || ""
      });
    }

    const transcribeRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      body: formData
    });

    if (transcribeRes.ok) {
      const trData = await transcribeRes.json();
      return res.status(200).json({
        success: true,
        text: trData.text || "",
        english_text: trData.text || ""
      });
    }

    const errText = await groqRes.text();
    return res.status(200).json({
      success: false,
      error: "Groq whisper audio transcription failed",
      details: errText
    });

  } catch (error) {
    console.error("Transcribe API error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Audio transcription error"
    });
  }
}
