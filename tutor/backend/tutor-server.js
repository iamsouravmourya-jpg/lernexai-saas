/**
 * Standalone Node.js Express Server for AI Tutor
 * Port: 3001 (or process.env.PORT)
 */

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.TUTOR_PORT || process.env.PORT || 3001;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

app.use(cors());
app.use(express.json());

function buildPrompt(body) {
  const historyText = Array.isArray(body.messageHistory) && body.messageHistory.length > 0
    ? `\nPrevious Conversation Context:\n${body.messageHistory.map((m) => `${m.sender === "user" ? "Student" : "Tutor"}: ${m.text}`).join("\n")}\n`
    : "";

  return `
You are an encouraging, world-class AI Tutor and Mentor assisting a student.

Context Information:
- Course: "${body.courseTitle || "General Course"}"
- Lesson: "${body.lessonTitle || "Current Lesson"}"
- Lesson Summary/Context: "${body.lessonContext || ""}"

${historyText}

Student Question: "${body.userMessage}"

System Instructions & Response Guidelines:
1. Speak as an expert, patient, and highly engaging tutor.
2. Provide clear, direct, step-by-step explanations.
3. If the user asks in Hindi or Hinglish, reply naturally in friendly Hinglish.
4. Keep explanations actionable and practical.
5. If you are unsure, say so honestly.
`;
}

async function generateTutorResponse(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is missing!");
  }

  const groq = new Groq({ apiKey: GROQ_API_KEY });
  const modelsToTry = [GROQ_MODEL, "llama-3.1-8b-instant", "llama-3.1-70b-versatile"];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 [AI Tutor] Calling model: ${modelName}...`);
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
    } catch (err) {
      lastError = err;
      const errMsg = err && err.message ? err.message : String(err);
      console.warn(`[AI Tutor Error] ${modelName}:`, errMsg);

      const isRateLimitOrTransient =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("rate");

      if (isRateLimitOrTransient) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw lastError || new Error("AI Tutor service is currently unavailable. Please try again.");
}

app.get("/api/tutor/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Tutor Standalone API",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/tutor/chat", async (req, res) => {
  try {
    const body = req.body || {};
    const userMessage = typeof body.userMessage === "string" ? body.userMessage.trim() : "";

    if (!userMessage) {
      return res.status(400).json({ error: "userMessage string is required" });
    }

    const prompt = buildPrompt(body);
    const replyText = await generateTutorResponse(prompt);

    return res.json({
      success: true,
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ AI Tutor Server Error:", error);
    return res.status(500).json({
      error: "AI Tutor failed to respond",
      details: error && error.message ? error.message : String(error),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Standalone AI Tutor Backend running at http://localhost:${PORT}`);
  console.log(`📌 Chat Endpoint: POST http://localhost:${PORT}/api/tutor/chat`);
});
