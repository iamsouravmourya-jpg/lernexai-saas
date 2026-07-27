// @ts-nocheck
// Supabase Edge Function for AI Tutor (Deno runtime)
// File location in your Supabase project: supabase/functions/tutor-chat/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Groq from "npm:groq-sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userMessage, courseTitle = "General Course", lessonTitle = "Current Lesson", lessonContext = "", messageHistory = [] } = await req.json();

    if (!userMessage) {
      return new Response(
        JSON.stringify({ success: false, error: "userMessage is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    const model = Deno.env.get("GROQ_MODEL") || "llama-3.1-8b-instant";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GROQ_API_KEY is missing in Supabase Secrets. Please set it using: supabase secrets set GROQ_API_KEY=\"your-key\"",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const historyText = Array.isArray(messageHistory) && messageHistory.length > 0
      ? `\nPrevious Conversation Context:\n${messageHistory.map((m: any) => `${m.sender === "user" ? "Student" : "Tutor"}: ${m.text}`).join("\n")}\n`
      : "";

    const prompt = `
You are an encouraging, world-class AI Tutor and Mentor assisting a student.

Context Information:
- Course: "${courseTitle}"
- Lesson: "${lessonTitle}"
- Lesson Summary/Context: "${lessonContext}"

${historyText}

Student Question: "${userMessage}"

System Guidelines:
1. Speak as an expert, patient, and highly engaging tutor.
2. Provide clear, direct, step-by-step explanations with markdown formatting.
3. If the user asks in Hindi or Hinglish, reply naturally in friendly Hinglish.
4. Keep explanations actionable and practical with formulas/code if applicable.
5. If you are unsure, say so honestly.
`;

    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a helpful AI tutor. Keep answers clear, friendly, and step-by-step." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 700,
    });

    const replyText = response.choices[0]?.message?.content || "No response received.";

    return new Response(
      JSON.stringify({ success: true, reply: replyText, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Supabase AI Tutor Edge Function Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
