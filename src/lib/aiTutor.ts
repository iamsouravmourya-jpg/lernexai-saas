import { supabase } from "./supabase";

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface AITutorUsage {
  count: number;
  limit: number;
  isFreePlan: boolean;
}

interface StoredAIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface HistoryResponse {
  messages?: StoredAIChatMessage[];
  usage?: AITutorUsage;
}

interface AskResponse {
  answer?: string;
  message?: StoredAIChatMessage;
  usage?: AITutorUsage;
}

async function functionErrorMessage(error: unknown, fallback: string) {
  const context = (error as { context?: Response } | null)?.context;
  if (context) {
    try {
      const body = await context.clone().json() as { error?: string };
      if (body.error) return body.error;
    } catch {
      // Fall back to the SDK error below when the response is not JSON.
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeMessage(message: StoredAIChatMessage): AIChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
  };
}

export async function fetchAIChatHistory(lessonId: string) {
  const { data, error } = await supabase.functions.invoke<HistoryResponse>("ai-tutor", {
    body: { action: "history", lessonId },
  });

  if (error) throw new Error(await functionErrorMessage(error, "Could not load AI tutor history."));

  return {
    messages: (data?.messages || []).map(normalizeMessage),
    usage: data?.usage || { count: 0, limit: 10, isFreePlan: true },
  };
}

export async function askAITutor(lessonId: string, question: string) {
  const { data, error } = await supabase.functions.invoke<AskResponse>("ai-tutor", {
    body: { action: "ask", lessonId, message: question },
  });

  if (error) throw new Error(await functionErrorMessage(error, "The AI tutor could not answer right now."));
  if (!data?.answer) throw new Error("The AI tutor returned an empty response.");

  return {
    message: data.message
      ? normalizeMessage(data.message)
      : {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: data.answer,
        },
    usage: data.usage || { count: 0, limit: 10, isFreePlan: true },
  };
}
