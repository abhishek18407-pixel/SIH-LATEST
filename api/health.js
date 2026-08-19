export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "online",
    service: "Smart City Civic Grievance AI Backend on Vercel",
    groq_configured: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.startsWith("gsk_your")),
    supabase_configured: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
    timestamp: new Date().toISOString()
  });
}
