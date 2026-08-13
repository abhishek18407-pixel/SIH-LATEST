import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

dotenv.config({ path: '../../.env' });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Groq AI Client
const groqApiKey = process.env.GROQ_API_KEY || '';
export const groq = new Groq({ apiKey: groqApiKey });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SIH Civic Grievance API Engine' });
});

app.listen(PORT, () => {
  console.log(`Backend API Server running on http://localhost:${PORT}`);
});
