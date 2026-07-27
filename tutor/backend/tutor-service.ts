/**
 * Standalone TypeScript AI Tutor Handler
 * Can be imported into any Express or Next.js API route.
 *
 * Example in Express:
 *   import { handleTutorChat } from './tutor/backend/tutor-service';
 *   app.post('/api/tutor/chat', handleTutorChat);
 */

import Groq from "groq-sdk";

export interface TutorChatRequest {
  userMessage: string;
  courseTitle?: string;
  lessonTitle?: string;
  lessonContext?: string;
  messageHistory?: Array<{ sender: "user" | "bot"; text: string }>;
}

export interface TutorChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
  timestamp: string;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function buildPrompt(input: TutorChatRequest) {
  const history = Array.isArray(input.messageHistory) && input.messageHistory.length > 0
    ? `\nPrevious Conversation:\n${input.messageHistory.map((m) => `${m.sender === "user" ? "Student" : "Tutor"}: ${m.text}`).join("\n")}\n`
    : "";

  return normalizeText(`
You are an encouraging, expert AI Tutor assisting a student.
Course: "${input.courseTitle || "General Course"}"
Lesson: "${input.lessonTitle || "Current Lesson"}"
Lesson Summary: "${input.lessonContext || ""}"

${history}
Student Question: "${input.userMessage}"

Guidelines:
1. Provide a clear, friendly, step-by-step response.
2. Use markdown formatting when helpful.
3. Support Hindi/Hinglish naturally.
4. Keep explanations practical and easy to understand.
5. If you are unsure, say so honestly.
  `);
}

export async function queryGroqTutor(
  prompt: string,
  apiKey: string = process.env.GROQ_API_KEY || "",
  model: string = process.env.GROQ_MODEL || "llama-3.1-8b-instant",
): Promise<string> {
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is missing");
  }

  const groq = new Groq({ apiKey });

  for (const modelName of [model, "llama-3.1-8b-instant", "llama-3.1-70b-versatile"]) {
    try {
      const response = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: "You are a helpful AI tutor. Keep answers clear, friendly, and step-by-step." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 700,
      });

      const content = response.choices[0]?.message?.content;
      if (typeof content === "string" && content.trim()) {
        return content.trim();
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const retryable = errMsg.includes("429") || errMsg.includes("503") || errMsg.includes("rate");
      if (!retryable) {
        continue;
      }
    }
  }

  throw new Error("AI Tutor service unavailable");
}

export async function handleTutorChat(req: any, res: any) {
  try {
    const input: TutorChatRequest = req.body;

    if (!input?.userMessage || typeof input.userMessage !== "string") {
      return res.status(400).json({
        success: false,
        error: "userMessage is required",
        timestamp: new Date().toISOString(),
      });
    }

    const prompt = buildPrompt(input);
    const reply = await queryGroqTutor(prompt);

    return res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "AI Tutor error",
      timestamp: new Date().toISOString(),
    });
  }
}
